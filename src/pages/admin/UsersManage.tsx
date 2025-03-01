
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// 간단한 관리자 인증 확인 훅
const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading };
};

// 가상의 회원 데이터
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'active' | 'inactive' | 'pending';
}

const initialUsers: User[] = [
  {
    id: 1,
    name: '김철수',
    email: 'chulsoo@example.com',
    phone: '010-1234-5678',
    registeredAt: '2023-05-15',
    status: 'active'
  },
  {
    id: 2,
    name: '이영희',
    email: 'younghee@example.com',
    phone: '010-8765-4321',
    registeredAt: '2023-06-20',
    status: 'active'
  },
  {
    id: 3,
    name: '박지민',
    email: 'jimin@example.com',
    phone: '010-9876-5432',
    registeredAt: '2023-07-10',
    status: 'pending'
  },
  {
    id: 4,
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-4567-8901',
    registeredAt: '2023-07-25',
    status: 'inactive'
  },
  {
    id: 5,
    name: '최민지',
    email: 'minji@example.com',
    phone: '010-3456-7890',
    registeredAt: '2023-08-05',
    status: 'active'
  }
];

const UsersManage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    // 실제 구현에서는 API 호출을 통해 회원 데이터를 가져옵니다.
    // 현재는 임시 데이터를 사용합니다.
    const savedUsers = localStorage.getItem('admin-users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Failed to parse users:', error);
        setUsers(initialUsers);
      }
    } else {
      setUsers(initialUsers);
    }
  }, []);
  
  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || 
    user.email.includes(searchTerm) || 
    user.phone.includes(searchTerm)
  );
  
  const handleStatusChange = (userId: number, newStatus: 'active' | 'inactive' | 'pending') => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('admin-users', JSON.stringify(updatedUsers));
    toast({
      title: "상태 변경",
      description: "회원 상태가 성공적으로 변경되었습니다.",
    });
  };
  
  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('admin-users', JSON.stringify(updatedUsers));
    toast({
      title: "회원 삭제",
      description: "회원이 성공적으로 삭제되었습니다.",
    });
    setIsDialogOpen(false);
  };
  
  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 인증 확인 중이거나 실패 시 빈 화면 표시
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-mainBlue">회원 관리</h1>
          <Button onClick={() => {
            navigate('/admin');
          }}>관리자 대시보드로 돌아가기</Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>회원 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="이름, 이메일 또는 전화번호로 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={() => setSearchTerm('')}>초기화</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>회원 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.registeredAt}</TableCell>
                        <TableCell>
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                            className="p-1 border rounded"
                          >
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="pending">대기중</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(user)}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>회원 삭제 확인</DialogTitle>
              <DialogDescription>
                {selectedUser && `${selectedUser.name}(${selectedUser.email}) 회원을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              >
                삭제
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
};

export default UsersManage;
