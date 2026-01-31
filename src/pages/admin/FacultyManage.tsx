import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { LoadingModal } from '@/components/admin/LoadingModal';
import axios from 'axios';
import { apiService } from '@/lib/apiService';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

interface Faculty {
  id?: string;
  _id?: string;
  name: string;
  imageUrl: string;
  biography: string;
  order?: number;
}

interface FacultyCategory {
  id: string;
  name: string; // 특별강사진 or 서울대 정치외교학부 교수진
  faculty: Faculty[];
}

interface TermFaculty {
  term: string; // 기수
  categories: FacultyCategory[];
}

const FacultyManage = () => {
  const { isAuthenticated, isLoading: authLoading, token } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  
  const [terms, setTerms] = useState<TermFaculty[]>([
    {
      term: '1',
      categories: [
        {
          id: '1',
          name: '특별강사진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        },
        {
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '' }]
        }
      ]
    }
  ]);
  
  // 원본 데이터 상태 추가 (변경 사항 추적용)
  const [originalTerms, setOriginalTerms] = useState<TermFaculty[]>([]);
  
  const [activeTermIndex, setActiveTermIndex] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<FacultyCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadLecturers();
    }
  }, [isAuthenticated]);
  
  // MongoDB에서 강사 데이터 불러오기
  const loadLecturers = async () => {
    try {
      setIsLoading(true);
      console.log('MongoDB에서 강사 데이터 불러오기 시작...');
      
      // apiService를 사용하여 모든 강사 데이터 가져오기
      const data = await apiService.getLecturersAll(token);
      
      console.log('서버에서 불러온 강사 데이터:', data);
      
      // 데이터가 있는 경우 처리
      if (data && Array.isArray(data)) {
        // 기수별, 카테고리별로 데이터 구성
        const processedData = processLecturerData(data);
        
        // 유효한 데이터가 있는 경우 설정
        if (processedData.length > 0) {
          setTerms(processedData);
          setOriginalTerms(JSON.parse(JSON.stringify(processedData))); // Deep copy for original data
          console.log('변환된 데이터 설정:', processedData);
          
          // 초기 카테고리 선택
          if (processedData[0].categories && processedData[0].categories.length > 0) {
            setSelectedCategory(processedData[0].categories[0]);
          }
        }
        
        toast({
          title: "데이터 로드 성공",
          description: "MongoDB에서 강사 데이터를 성공적으로 불러왔습니다.",
        });
      } else {
        console.log('불러온 데이터가 없거나 형식이 맞지 않습니다. 로컬 스토리지에서 시도합니다.');
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('강사 데이터 로드 실패:', error);
      toast({
        title: "데이터 로드 실패",
        description: "강사 데이터를 불러오는데 실패했습니다. 로컬 데이터를 사용합니다.",
        variant: "destructive"
      });
      
      // API 실패 시 localStorage에서 가져오기
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // 서버에서 받은 강사 데이터를 앱 형식으로 변환
  const processLecturerData = (lecturers) => {
    const groupedByTerm = {};
    
    // 기수별로 데이터 그룹화
    lecturers.forEach(lecturer => {
      if (!groupedByTerm[lecturer.term]) {
        groupedByTerm[lecturer.term] = {
          '특별강사진': [],
          '서울대 정치외교학부 교수진': []
        };
      }
      
      // 카테고리에 따라 분류
      if (lecturer.category && groupedByTerm[lecturer.term][lecturer.category] !== undefined) {
        groupedByTerm[lecturer.term][lecturer.category].push({
          id: lecturer._id,
          _id: lecturer._id,
          name: lecturer.name,
          imageUrl: lecturer.imageUrl || '',
          biography: lecturer.biography || '',
          order: lecturer.order
        });
      }
    });
    
    // 앱 형식으로 변환
    const result = [];
    Object.keys(groupedByTerm).forEach((term, termIndex) => {
      const categories = [];
      
      // 특별강사진 카테고리 추가
      if (groupedByTerm[term]['특별강사진'].length > 0) {
        categories.push({
          id: '1',
          name: '특별강사진',
          faculty: groupedByTerm[term]['특별강사진']
        });
      } else {
        categories.push({
          id: '1',
          name: '특별강사진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
        });
      }
      
      // 서울대 정치외교학부 교수진 카테고리 추가
      if (groupedByTerm[term]['서울대 정치외교학부 교수진'].length > 0) {
        categories.push({
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: groupedByTerm[term]['서울대 정치외교학부 교수진']
        });
      } else {
        categories.push({
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
        });
      }
      
      result.push({
        term,
        categories
      });
    });
    
    // 데이터가 없는 경우 기본 구조 반환
    if (result.length === 0) {
      return [{
        term: '1',
        categories: [
          {
            id: '1',
            name: '특별강사진',
            faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
          },
          {
            id: '2',
            name: '서울대 정치외교학부 교수진',
            faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
          }
        ]
      }];
    }
    
    return result;
  };
  
  // 로컬 스토리지에서 기존 데이터 로드
  const loadFromLocalStorage = () => {
    const savedFaculty = localStorage.getItem('faculty-data');
    
    if (savedFaculty) {
      try {
        const parsedFaculty = JSON.parse(savedFaculty);
        console.log('로컬 스토리지에서 로드된 데이터:', parsedFaculty);
        
        // 데이터 구조 확인
        if (Array.isArray(parsedFaculty) && parsedFaculty.length > 0) {
          // 각 기수에 카테고리가 있는지 확인
          const validData = parsedFaculty.map(term => {
            // 카테고리가 없거나 비어있는 경우 기본 카테고리 추가
            if (!term.categories || term.categories.length === 0) {
              return {
                ...term,
                categories: [
                  {
                    id: '1',
                    name: '특별강사진',
                    faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
                  },
                  {
                    id: '2',
                    name: '서울대 정치외교학부 교수진',
                    faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
                  }
                ]
              };
            }
            
            // 카테고리가 있지만 '서울대 정치외교학부 교수진'이 없는 경우 추가
            const hasSpecial = term.categories.some(cat => cat.name === '특별강사진');
            const hasFaculty = term.categories.some(cat => cat.name === '서울대 정치외교학부 교수진');
            
            const updatedCategories = [...term.categories];
            
            if (!hasSpecial) {
              updatedCategories.push({
                id: '1',
                name: '특별강사진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
              });
            }
            
            if (!hasFaculty) {
              updatedCategories.push({
                id: '2',
                name: '서울대 정치외교학부 교수진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
              });
            }
            
            return {
              ...term,
              categories: updatedCategories
            };
          });
          
          setTerms(validData);
          setOriginalTerms(JSON.parse(JSON.stringify(validData))); // Deep copy for original data
          console.log('유효한 데이터로 변환:', validData);
        } else {
          const defaultData = [{
            term: '1',
            categories: [
              {
                id: '1',
                name: '특별강사진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
              },
              {
                id: '2',
                name: '서울대 정치외교학부 교수진',
                faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
              }
            ]
          }];
          setTerms(defaultData);
          setOriginalTerms(JSON.parse(JSON.stringify(defaultData)));
        }
        
        // 카테고리 인덱스 초기화
        setActiveCategoryIndex(0);
        console.log('로컬 스토리지에서 데이터 로드 완료');
      } catch (error) {
        console.error('Failed to parse faculty data:', error);
        // 오류 발생 시 기본 데이터로 초기화
        const defaultData = [{
          term: '1',
          categories: [
            {
              id: '1',
              name: '특별강사진',
              faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
            },
            {
              id: '2',
              name: '서울대 정치외교학부 교수진',
              faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
            }
          ]
        }];
        setTerms(defaultData);
        setOriginalTerms(JSON.parse(JSON.stringify(defaultData)));
      }
    } else {
      const defaultData = [{
        term: '1',
        categories: [
          {
            id: '1',
            name: '특별강사진',
            faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
          },
          {
            id: '2',
            name: '서울대 정치외교학부 교수진',
            faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
          }
        ]
      }];
      setTerms(defaultData);
      setOriginalTerms(JSON.parse(JSON.stringify(defaultData)));
    }
  };
  
  // 현재 선택된 카테고리 업데이트
  useEffect(() => {
    if (terms.length > 0 && terms[activeTermIndex] && terms[activeTermIndex].categories.length > activeCategoryIndex) {
      setSelectedCategory(terms[activeTermIndex].categories[activeCategoryIndex]);
      console.log('선택된 카테고리 업데이트:', terms[activeTermIndex].categories[activeCategoryIndex].name);
    }
  }, [terms, activeTermIndex, activeCategoryIndex]);
  
  // 컴포넌트 마운트 시 selectedCategory 초기화
  useEffect(() => {
    if (terms.length > 0 && terms[0].categories && terms[0].categories.length > 0) {
      setSelectedCategory(terms[0].categories[0]);
      console.log('컴포넌트 마운트 시 selectedCategory 초기화:', terms[0].categories[0].name);
    }
  }, []);
  
  // 새 기수 추가
  const addTerm = () => {
    const lastTerm = terms.length > 0 ? parseInt(terms[terms.length - 1].term) : 0;
    const newTerm = (lastTerm + 1).toString();
    
    const newTermData = {
      term: newTerm,
      categories: [
        {
          id: '1',
          name: '특별강사진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
        },
        {
          id: '2',
          name: '서울대 정치외교학부 교수진',
          faculty: [{ id: '1', name: '', imageUrl: '', biography: '', order: 0 }]
        }
      ]
    };
    
    setTerms([...terms, newTermData]);
    
    // 새로 추가된 기수로 활성 탭 변경
    setActiveTermIndex(terms.length);
    setActiveCategoryIndex(0);
    setSelectedCategory(newTermData.categories[0]);
  };
  
  // 기수 삭제
  const removeTerm = (termIndex: number) => {
    if (terms.length <= 1) {
      toast({
        title: "삭제 불가",
        description: "최소 하나의 기수는 유지해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    const newTerms = terms.filter((_, index) => index !== termIndex);
    setTerms(newTerms);
    
    // 삭제된 기수가 현재 활성 기수인 경우, 활성 기수 변경
    if (termIndex === activeTermIndex) {
      setActiveTermIndex(0);
    } else if (termIndex < activeTermIndex) {
      setActiveTermIndex(activeTermIndex - 1);
    }
  };
  
  // 강사 추가
  const addFaculty = (termIndex: number, categoryIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    const lastId = selectedCategory.faculty.length > 0 
      ? parseInt(selectedCategory.faculty[selectedCategory.faculty.length - 1].id)
      : 0;
    
    const newFaculty = {
      id: (lastId + 1).toString(),
      name: '',
      imageUrl: '',
      biography: '',
      order: 0
    };
    
    newTerms[termIndex].categories[categoryIndex].faculty.push(newFaculty);
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    setSelectedCategory({
      ...selectedCategory,
      faculty: [...selectedCategory.faculty, newFaculty]
    });
  };
  
  // 강사 삭제
  const removeFaculty = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    
    if (selectedCategory.faculty.length <= 1) {
      toast({
        title: "삭제 불가",
        description: "최소 하나의 강사는 유지해야 합니다.",
        variant: "destructive"
      });
      return;
    }
    
    newTerms[termIndex].categories[categoryIndex].faculty = 
      newTerms[termIndex].categories[categoryIndex].faculty.filter((_, index) => index !== facultyIndex);
    
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    setSelectedCategory({
      ...selectedCategory,
      faculty: selectedCategory.faculty.filter((_, index) => index !== facultyIndex)
    });
  };
  
  // 강사 정보 변경
  const handleFacultyChange = (
    termIndex: number,
    categoryIndex: number,
    facultyIndex: number,
    field: keyof Faculty,
    value: string | number
  ) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    (newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex] as any)[field] = value;
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    const updatedFaculty = [...selectedCategory.faculty];
    updatedFaculty[facultyIndex] = {
      ...updatedFaculty[facultyIndex],
      [field]: value
    };
    
    setSelectedCategory({
      ...selectedCategory,
      faculty: updatedFaculty
    });
  };
  
  // 이미지 파일 선택 처리
  const handleImageChange = (
    termIndex: number,
    categoryIndex: number,
    facultyIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedCategory) return;
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // 파일 크기 제한 (10MB - 업로드 전 원본 크기)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "파일 크기 초과",
          description: "원본 이미지 크기는 10MB 이하여야 합니다.",
          variant: "destructive",
        });
        return;
      }
      
      // 이미지 타입 확인
      if (!file.type.startsWith('image/')) {
        toast({
          title: "잘못된 파일 형식",
          description: "이미지 파일만 업로드할 수 있습니다.",
          variant: "destructive",
        });
        return;
      }
      
      // 이미지 리사이징 및 Base64 변환
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // 리사이징을 위한 캔버스 생성
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 프로필 이미지 최적 크기: 400x400 (웹 표시용으로 충분)
          const maxWidth = 400;
          const maxHeight = 400;
          
          // 비율 유지하며 리사이징
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // 고품질 렌더링 설정
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // 최적 품질로 압축 (JPEG 포맷, 품질 0.75)
            let base64String = canvas.toDataURL('image/jpeg', 0.75);
            let quality = 0.75;
            
            // Base64 문자열 크기 계산 (대략적인 바이트 크기)
            const getBase64Size = (str: string) => {
              return Math.round((str.length * 3) / 4);
            };
            
            // 최종 이미지 크기가 500KB를 초과하면 품질을 더 낮춤
            const targetSize = 500 * 1024; // 500KB
            let imageSize = getBase64Size(base64String);
            
            while (imageSize > targetSize && quality > 0.5) {
              quality -= 0.05;
              base64String = canvas.toDataURL('image/jpeg', quality);
              imageSize = getBase64Size(base64String);
            }
            
            // 최종 크기 로그 출력
            console.log(`이미지 최적화 완료:
              - 원본 크기: ${Math.round(file.size / 1024)}KB
              - 최종 크기: ${Math.round(imageSize / 1024)}KB
              - 해상도: ${width}x${height}
              - 압축 품질: ${Math.round(quality * 100)}%
              - 용량 절감: ${Math.round((1 - imageSize / file.size) * 100)}%`
            );
            
            // 이미지 URL 설정
            const newTerms = [...terms];
            newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex].imageUrl = base64String;
            setTerms(newTerms);
            
            // selectedCategory 업데이트
            const updatedFaculty = [...selectedCategory.faculty];
            updatedFaculty[facultyIndex] = {
              ...updatedFaculty[facultyIndex],
              imageUrl: base64String
            };
            
            setSelectedCategory({
              ...selectedCategory,
              faculty: updatedFaculty
            });
            
            toast({
              title: "이미지 업로드 성공",
              description: `이미지가 최적화되었습니다. (${Math.round(file.size / 1024)}KB → ${Math.round(imageSize / 1024)}KB, ${width}x${height})`,
            });
          }
        };
        
        img.onerror = () => {
          toast({
            title: "이미지 처리 오류",
            description: "이미지를 처리할 수 없습니다.",
            variant: "destructive",
          });
        };
        
        img.src = event.target?.result as string;
      };
      
      reader.onerror = () => {
        toast({
          title: "파일 읽기 오류",
          description: "파일을 읽는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // 이미지 버튼 클릭 처리
  const handleImageButtonClick = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    fileInputRefs.current[`${termIndex}-${categoryIndex}-${facultyIndex}`]?.click();
  };
  
  // 이미지 제거
  const handleRemoveImage = (termIndex: number, categoryIndex: number, facultyIndex: number) => {
    if (!selectedCategory) return;
    
    const newTerms = [...terms];
    newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex].imageUrl = '';
    setTerms(newTerms);
    
    // selectedCategory 업데이트
    const updatedFaculty = [...selectedCategory.faculty];
    updatedFaculty[facultyIndex] = {
      ...updatedFaculty[facultyIndex],
      imageUrl: ''
    };
    
    setSelectedCategory({
      ...selectedCategory,
      faculty: updatedFaculty
    });
  };
  
  // 변경 사항 감지 함수들 추가
  const findChangedFaculty = () => {
    const changes = {
      created: [],
      updated: [],
      deleted: []
    };

    // 현재 데이터에서 모든 강사 수집
    const currentFaculty = [];
    terms.forEach(term => {
      term.categories.forEach(category => {
        category.faculty.forEach(faculty => {
          if (faculty.name && faculty.name.trim() !== '') {
            currentFaculty.push({
              ...faculty,
              term: term.term,
              category: category.name
            });
          }
        });
      });
    });

    // 원본 데이터에서 모든 강사 수집
    const originalFaculty = [];
    originalTerms.forEach(term => {
      term.categories.forEach(category => {
        category.faculty.forEach(faculty => {
          if (faculty.name && faculty.name.trim() !== '') {
            originalFaculty.push({
              ...faculty,
              term: term.term,
              category: category.name
            });
          }
        });
      });
    });

    // 새로 생성된 강사 찾기 (원본에는 없고 현재에는 있는)
    currentFaculty.forEach(current => {
      if (!current._id) {
        // _id가 없으면 새로운 강사
        changes.created.push(current);
      } else {
        // 기존 강사인 경우 변경사항 확인
        const original = originalFaculty.find(orig => orig._id === current._id);
        if (original) {
          // 내용이 변경되었는지 확인
          if (
            original.name !== current.name ||
            original.biography !== current.biography ||
            original.imageUrl !== current.imageUrl ||
            original.term !== current.term ||
            original.category !== current.category ||
            original.order !== current.order
          ) {
            changes.updated.push(current);
          }
        }
      }
    });

    // 삭제된 강사 찾기 (원본에는 있고 현재에는 없는)
    originalFaculty.forEach(original => {
      if (original._id && !currentFaculty.find(current => current._id === original._id)) {
        changes.deleted.push(original);
      }
    });

    return changes;
  };
  
  // 저장 (변경된 데이터만 업데이트)
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      console.log('강사 데이터 변경 사항 감지 시작...');
      
      const changes = findChangedFaculty();
      console.log('감지된 변경 사항:', changes);

      let operationCount = 0;

      // 삭제된 강사 처리
      if (changes.deleted.length > 0) {
        console.log(`${changes.deleted.length}명의 강사 삭제 시작...`);
        for (const faculty of changes.deleted) {
          if (faculty._id) {
            try {
              await apiService.deleteLecturer(faculty._id, token);
              operationCount++;
              console.log(`강사 ${faculty.name} 삭제 완료`);
            } catch (deleteError) {
              console.error(`강사 ${faculty.name} 삭제 중 오류:`, deleteError);
            }
          }
        }
      }

      // 새로 생성된 강사 처리
      if (changes.created.length > 0) {
        console.log(`${changes.created.length}명의 새 강사 생성 시작...`);
        for (const faculty of changes.created) {
          // biography 줄바꿈 확인
          console.log(`강사 ${faculty.name} biography:`, {
            원본: faculty.biography,
            길이: faculty.biography?.length || 0,
            줄바꿈포함: faculty.biography?.includes('\n') || false,
            줄바꿈개수: (faculty.biography?.match(/\n/g) || []).length
          });
          
          const lecturerData = {
             name: faculty.name,
             biography: faculty.biography || '',
             imageUrl: faculty.imageUrl || '',
             term: faculty.term,
             category: faculty.category,
             order: faculty.order !== undefined ? faculty.order : operationCount++,
             isActive: true
           };

          try {
            const response = await apiService.createLecturer(lecturerData, token);
            console.log(`새 강사 ${faculty.name} 생성 완료`);
            
            // 생성된 강사의 _id를 현재 데이터에 업데이트
            const termIndex = terms.findIndex(t => t.term === faculty.term);
            if (termIndex !== -1) {
              const categoryIndex = terms[termIndex].categories.findIndex(c => c.name === faculty.category);
              if (categoryIndex !== -1) {
                const facultyIndex = terms[termIndex].categories[categoryIndex].faculty.findIndex(f => 
                  f.name === faculty.name && !f._id
                );
                if (facultyIndex !== -1) {
                  const newTerms = [...terms];
                  newTerms[termIndex].categories[categoryIndex].faculty[facultyIndex]._id = response._id;
                  setTerms(newTerms);
                }
              }
            }
          } catch (createError) {
            console.error(`강사 ${faculty.name} 생성 중 오류:`, createError);
          }
        }
      }

      // 업데이트된 강사 처리
      if (changes.updated.length > 0) {
        console.log(`${changes.updated.length}명의 강사 업데이트 시작...`);
        for (const faculty of changes.updated) {
          if (faculty._id) {
            // biography 줄바꿈 확인
            console.log(`강사 ${faculty.name} biography 업데이트:`, {
              원본: faculty.biography,
              길이: faculty.biography?.length || 0,
              줄바꿈포함: faculty.biography?.includes('\n') || false,
              줄바꿈개수: (faculty.biography?.match(/\n/g) || []).length
            });
            
            const updateData = {
               name: faculty.name,
               biography: faculty.biography || '',
               imageUrl: faculty.imageUrl || '',
               term: faculty.term,
               category: faculty.category,
               order: faculty.order !== undefined ? faculty.order : operationCount++,
               isActive: true
             };

            try {
              await apiService.updateLecturer(faculty._id, updateData, token);
              console.log(`강사 ${faculty.name} 업데이트 완료`);
            } catch (updateError) {
              console.error(`강사 ${faculty.name} 업데이트 중 오류:`, updateError);
            }
          }
        }
      }

      // 변경사항이 없는 경우
      if (changes.created.length === 0 && changes.updated.length === 0 && changes.deleted.length === 0) {
        toast({
          title: "변경사항 없음",
          description: "저장할 변경사항이 없습니다.",
        });
        return;
      }

      // 로컬 스토리지에도 백업으로 저장 (이미지 제외하여 용량 절약)
      const termsWithoutImages = terms.map(term => ({
        ...term,
        categories: term.categories.map(cat => ({
          ...cat,
          faculty: cat.faculty.map(f => ({
            ...f,
            imageUrl: f.imageUrl ? '[이미지 있음]' : ''
          }))
        }))
      }));
      localStorage.setItem('faculty-data', JSON.stringify(termsWithoutImages));
      
      // 원본 데이터 업데이트 (다음 변경 사항 감지를 위해)
      setOriginalTerms(JSON.parse(JSON.stringify(terms)));

      const totalOperations = changes.created.length + changes.updated.length + changes.deleted.length;
      toast({
        title: "저장 완료",
        description: `${totalOperations}개의 변경사항이 MongoDB에 성공적으로 반영되었습니다. (생성: ${changes.created.length}, 수정: ${changes.updated.length}, 삭제: ${changes.deleted.length})`,
      });
      
    } catch (error) {
      console.error('강사 정보 저장 실패:', error);
      toast({
        title: "저장 실패",
        description: "MongoDB에 데이터를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <LoadingModal isOpen={true} message="강사진 데이터를 불러오는 중입니다..." />
      </AdminLayout>
    );
  }

  if (!isAuthenticated && !authLoading) {
    navigate('/admin/login');
    return null;
  }
  
  return (
    <AdminLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">강사진 관리</CardTitle>
          <p className="text-gray-500 mt-2">
            기수별로 강사진 정보를 관리합니다. 특별강사진과 서울대 정치외교학부 교수진을 추가할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-lg text-mainBlue">기수 선택</h3>
              <Button 
                onClick={addTerm} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                기수 추가
              </Button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
              <p className="text-sm text-slate-600 mb-3">현재 선택된 기수: <span className="font-bold text-mainBlue">{activeTermIndex + 1}기</span></p>
              
              <div className="inline-flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-mainBlue/20 shadow-sm">
                {terms.map((term, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Button
                      type="button"
                      onClick={() => setActiveTermIndex(index)}
                      className={`flex-shrink-0 px-6 py-2.5 text-base font-semibold rounded-lg transition-all duration-200 border-2 ${
                        activeTermIndex === index
                          ? 'bg-mainBlue text-white shadow-md border-mainBlue'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-mainBlue/50'
                      }`}
                    >
                      {index + 1}기
                    </Button>
                    {terms.length > 1 && (
                      <Button 
                        onClick={() => removeTerm(index)} 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {terms[activeTermIndex] && (
              <div className="space-y-6">
                {/* 카테고리 선택 */}
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-mainBlue">카테고리 선택</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      아래 버튼을 클릭하여 입력할 강사진 카테고리를 선택하세요.
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                      <p className="text-sm text-slate-600">현재 선택된 카테고리: <span className="font-bold text-mainBlue">{selectedCategory?.name || '없음'}</span></p>
                    </div>
                  </div>
                  
                  {/* 카테고리 버튼 */}
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {terms[activeTermIndex].categories && terms[activeTermIndex].categories.length > 0 ? (
                      terms[activeTermIndex].categories.map((category, categoryIndex) => (
                        <button
                          key={categoryIndex}
                          type="button"
                          className={`py-5 px-6 rounded-lg text-center transition-all text-lg border-2 ${
                            activeCategoryIndex === categoryIndex 
                              ? 'bg-mainBlue text-white font-bold shadow-md border-mainBlue ring-2 ring-mainBlue/30' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-mainBlue/30'
                          }`}
                          onClick={() => {
                            console.log('카테고리 버튼 클릭:', categoryIndex, category.name);
                            setActiveCategoryIndex(categoryIndex);
                            setSelectedCategory(category);
                            
                            // 상태 업데이트 확인을 위한 알림
                            toast({
                              title: `${category.name} 선택됨`,
                              description: "이제 이 카테고리의 강사진을 관리할 수 있습니다.",
                              duration: 2000,
                            });
                          }}
                        >
                          {activeCategoryIndex === categoryIndex && (
                            <span className="inline-block mr-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          )}
                          {category.name}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-4 bg-gray-100 rounded-lg">
                        <p className="text-gray-500">카테고리가 없습니다.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 선택된 카테고리 내용 */}
                  <div className="space-y-6 mt-4">
                    {selectedCategory && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{selectedCategory.name} 목록</h3>
                        </div>
                        
                        {selectedCategory.faculty.map((faculty, facultyIndex) => (
                          <div key={facultyIndex} className="border p-4 rounded-md space-y-4 bg-gray-50">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">강사 #{facultyIndex + 1}</h3>
                              <Button 
                                onClick={() => removeFaculty(activeTermIndex, activeCategoryIndex, facultyIndex)} 
                                variant="destructive" 
                                size="sm"
                                disabled={selectedCategory.faculty.length <= 1}
                              >
                                삭제
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">성명 <span className="text-red-500">*</span></label>
                                <Input
                                  value={faculty.name}
                                  onChange={(e) => handleFacultyChange(activeTermIndex, activeCategoryIndex, facultyIndex, 'name', e.target.value)}
                                  placeholder="강사 성명"
                                  required
                                />
                                {faculty.name.trim() === '' && (
                                  <p className="text-xs text-red-500">성명은 필수 입력 항목입니다.</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  노출 순서 
                                  {selectedCategory?.name === '특별강사진' && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={faculty.order || 0}
                                  onChange={(e) => handleFacultyChange(activeTermIndex, activeCategoryIndex, facultyIndex, 'order', parseInt(e.target.value) || 0)}
                                  placeholder="순서 (0부터 시작)"
                                />
                                <p className="text-xs text-gray-500">
                                  숫자가 낮을수록 먼저 표시됩니다 (0, 1, 2, 3...)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">프로필 이미지</label>
                                <div className="flex flex-col space-y-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageChange(activeTermIndex, activeCategoryIndex, facultyIndex, e)}
                                    ref={(el) => fileInputRefs.current[`${activeTermIndex}-${activeCategoryIndex}-${facultyIndex}`] = el}
                                  />
                                  <div className="flex space-x-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => handleImageButtonClick(activeTermIndex, activeCategoryIndex, facultyIndex)}
                                      className="flex-1"
                                    >
                                      {faculty.imageUrl ? '이미지 변경' : '이미지 선택'}
                                    </Button>
                                    {faculty.imageUrl && (
                                      <Button 
                                        type="button" 
                                        variant="destructive" 
                                        onClick={() => handleRemoveImage(activeTermIndex, activeCategoryIndex, facultyIndex)}
                                        size="sm"
                                      >
                                        삭제
                                      </Button>
                                    )}
                                  </div>
                                  {faculty.imageUrl && (
                                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                                      <img 
                                        src={faculty.imageUrl} 
                                        alt={faculty.name || '강사 이미지'} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">약력</label>
                              <Textarea
                                value={faculty.biography}
                                onChange={(e) => handleFacultyChange(activeTermIndex, activeCategoryIndex, facultyIndex, 'biography', e.target.value)}
                                placeholder="강사 약력 정보 (여러 줄로 입력 가능)"
                                rows={5}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {selectedCategory && (
            <Button 
              onClick={() => addFaculty(activeTermIndex, activeCategoryIndex)}
              variant="outline"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 font-medium border-0 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>강사 추가</span>
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-mainBlue hover:bg-blue-700 text-white font-medium px-6 py-2"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>저장 중...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>저장하기</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default FacultyManage; 