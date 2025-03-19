import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiService } from '@/lib/apiService';
import axios from 'axios';

interface Item {
  text: string;
}

interface Document {
  name: string;
  description: string;
}

interface AdmissionInfo {
  _id?: string;
  title: string;
  term: string;
  year: string;
  startMonth: string;
  endMonth: string;
  capacity: string;
  qualificationContent: string;
  targets: Item[];
  applicationMethodContent: string;
  requiredDocuments: Document[];
  applicationProcessContent: string;
  applicationAddress: string;
  scheduleContent: string;
  educationLocation: string;
  classSchedule: string;
  additionalItems: Item[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdmissionManage = () => {
  const { toast } = useToast();
  const [admissionInfo, setAdmissionInfo] = useState<AdmissionInfo>({
    title: '서울대학교 정치리더십과정',
    term: '제25',
    year: '2025',
    startMonth: '3',
    endMonth: '8',
    capacity: '30',
    qualificationContent: '다음 중 하나 이상에 해당하는 전·현직자',
    targets: [
      { text: '국회의원, 전직 국회의원' },
      { text: '정당 소속 정치인' },
      { text: '정부 고위 공직자' }
    ],
    applicationMethodContent: '아래 서류를 구비하여 우편 또는 이메일로 제출',
    requiredDocuments: [
      { name: '입학지원서', description: '' },
      { name: '재직증명서 또는 경력증명서', description: '이메일 접수 시, 사진 촬영 사본 제출 가능' },
      { name: '증명사진', description: '1매' },
      { name: '개인정보수집이용동의서', description: '' }
    ],
    applicationProcessContent: '홈페이지(plpsnu.ne.kr)에서 다운로드, 우편 또는 이메일 접수',
    applicationAddress: '우편 접수 주소: (08826) 서울특별시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정\n이메일 접수 주소: plp@snu.ac.kr',
    scheduleContent: '원서 교부 및 접수 기간: 2025년 1월 10일 ~ 2월 15일',
    educationLocation: '서울대학교 행정대학원',
    classSchedule: '매주 금요일 14:00~17:30',
    additionalItems: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmissionData();
  }, []);
  
  // MongoDB에서 입학 정보 데이터 가져오기
  const fetchAdmissionData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAdmission();
      console.log('Admission data loaded:', data);
      if (data) {
        setAdmissionInfo(data);
      }
      setError(null);
    } catch (err) {
      console.error('입학 정보를 불러오는 중 오류가 발생했습니다:', err);
      setError('입학 정보를 불러오는 중 오류가 발생했습니다.');
      toast({
        title: "데이터 로드 실패",
        description: "입학 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicInfoChange = (field: keyof AdmissionInfo, value: string) => {
    setAdmissionInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetChange = (index: number, value: string) => {
    const newTargets = [...admissionInfo.targets];
    newTargets[index].text = value;
    setAdmissionInfo(prev => ({ ...prev, targets: newTargets }));
  };

  const addTarget = () => {
    setAdmissionInfo(prev => ({
      ...prev,
      targets: [...prev.targets, { text: '' }]
    }));
  };

  const removeTarget = (index: number) => {
    if (admissionInfo.targets.length > 1) {
      const newTargets = admissionInfo.targets.filter((_, i) => i !== index);
      setAdmissionInfo(prev => ({ ...prev, targets: newTargets }));
    }
  };

  const handleDocumentChange = (index: number, field: keyof Document, value: string) => {
    const newDocuments = [...admissionInfo.requiredDocuments];
    newDocuments[index] = { ...newDocuments[index], [field]: value };
    setAdmissionInfo(prev => ({ ...prev, requiredDocuments: newDocuments }));
  };

  const addDocument = () => {
    setAdmissionInfo(prev => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, { name: '', description: '' }]
    }));
  };

  const removeDocument = (index: number) => {
    if (admissionInfo.requiredDocuments.length > 1) {
      const newDocuments = admissionInfo.requiredDocuments.filter((_, i) => i !== index);
      setAdmissionInfo(prev => ({ ...prev, requiredDocuments: newDocuments }));
    }
  };

  const handleAdditionalItemChange = (index: number, value: string) => {
    const newItems = [...admissionInfo.additionalItems];
    newItems[index].text = value;
    setAdmissionInfo(prev => ({ ...prev, additionalItems: newItems }));
  };

  const addAdditionalItem = () => {
    setAdmissionInfo(prev => ({
      ...prev,
      additionalItems: [...prev.additionalItems, { text: '' }]
    }));
  };

  const removeAdditionalItem = (index: number) => {
    const newItems = admissionInfo.additionalItems.filter((_, i) => i !== index);
    setAdmissionInfo(prev => ({ ...prev, additionalItems: newItems }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // MongoDB API를 통해 데이터 저장
      const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api';
      
      let response;
      const saveData = { ...admissionInfo };
      
      // _id가 있으면 PUT(수정), 없으면 POST(신규 추가)
      if (admissionInfo._id) {
        response = await axios.put(`${API_BASE_URL}/admission`, saveData);
      } else {
        response = await axios.post(`${API_BASE_URL}/admission`, saveData);
      }
      
      // 저장 후 최신 데이터로 업데이트
      setAdmissionInfo(response.data);
      
      toast({
        title: "저장 완료",
        description: "입학 지원 정보가 저장되었습니다.",
      });
    } catch (err) {
      console.error('입학 정보 저장 중 오류가 발생했습니다:', err);
      toast({
        title: "저장 실패",
        description: "입학 정보를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">입학 지원 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Input 
                value={admissionInfo.title}
                onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                className="w-64"
              />
              <Input 
                value={admissionInfo.term}
                onChange={(e) => handleBasicInfoChange('term', e.target.value)}
                className="w-16"
                placeholder="기수"
              />
              <span>기</span>
            </div>
            <div className="flex items-center gap-2">
              <span>(</span>
              <Input 
                value={admissionInfo.year}
                onChange={(e) => handleBasicInfoChange('year', e.target.value)}
                className="w-20"
              />
              <span>년</span>
              <Input 
                value={admissionInfo.startMonth}
                onChange={(e) => handleBasicInfoChange('startMonth', e.target.value)}
                className="w-16"
              />
              <span>~</span>
              <Input 
                value={admissionInfo.endMonth}
                onChange={(e) => handleBasicInfoChange('endMonth', e.target.value)}
                className="w-16"
              />
              <span>월)</span>
            </div>
            <span className="ml-2">지원 안내</span>
          </div>
        </CardContent>
      </Card>

      {/* 모집 인원 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>모집 인원</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Input 
                value={admissionInfo.capacity}
                onChange={(e) => handleBasicInfoChange('capacity', e.target.value)}
                className="w-20"
              />
              <span>명 내외</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 지원 자격 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>지원 자격</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="mb-2 block">내용</Label>
            <Textarea 
              value={admissionInfo.qualificationContent}
              onChange={(e) => handleBasicInfoChange('qualificationContent', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">모집 대상</Label>
            {admissionInfo.targets.map((target, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <span>{index + 1}.</span>
                <Input 
                  value={target.text}
                  onChange={(e) => handleTargetChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTarget(index)}
                  disabled={admissionInfo.targets.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={addTarget}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              항목 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 교육 기간 및 장소 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>교육 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="mb-2 block">교육 장소</Label>
            <Input 
              value={admissionInfo.educationLocation}
              onChange={(e) => handleBasicInfoChange('educationLocation', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">수업 일정</Label>
            <Input 
              value={admissionInfo.classSchedule}
              onChange={(e) => handleBasicInfoChange('classSchedule', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 지원 방법 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>지원 방법</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label className="mb-2 block">지원 방법 내용</Label>
            <Textarea 
              value={admissionInfo.applicationMethodContent}
              onChange={(e) => handleBasicInfoChange('applicationMethodContent', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">접수 방법</Label>
            <Textarea 
              value={admissionInfo.applicationProcessContent}
              onChange={(e) => handleBasicInfoChange('applicationProcessContent', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">접수처</Label>
            <Textarea 
              value={admissionInfo.applicationAddress}
              onChange={(e) => handleBasicInfoChange('applicationAddress', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="mb-4">
            <Label className="mb-2 block">전형 일정</Label>
            <Textarea 
              value={admissionInfo.scheduleContent}
              onChange={(e) => handleBasicInfoChange('scheduleContent', e.target.value)}
              className="min-h-20"
            />
          </div>
        </CardContent>
      </Card>

      {/* 제출 서류 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>제출 서류</CardTitle>
        </CardHeader>
        <CardContent>
          {admissionInfo.requiredDocuments.map((doc, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{index + 1}.</span>
                <Input 
                  value={doc.name}
                  onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                  className="flex-1"
                  placeholder="서류명"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  disabled={admissionInfo.requiredDocuments.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="ml-6">
                <Input 
                  value={doc.description}
                  onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                  className="w-full"
                  placeholder="설명 (선택사항)"
                />
              </div>
              {index < admissionInfo.requiredDocuments.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={addDocument}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            서류 추가
          </Button>
        </CardContent>
      </Card>

      {/* 기타 추가 항목 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>기타 추가 항목</CardTitle>
        </CardHeader>
        <CardContent>
          {admissionInfo.additionalItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <span>{index + 1}.</span>
              <Input 
                value={item.text}
                onChange={(e) => handleAdditionalItemChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAdditionalItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={addAdditionalItem}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            항목 추가
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdmissionManage; 