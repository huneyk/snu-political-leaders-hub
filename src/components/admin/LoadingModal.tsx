import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export const LoadingModal = ({ isOpen, message = "데이터를 불러오는 중입니다..." }: LoadingModalProps) => {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-mainBlue"></div>
          <p className="text-lg font-medium text-mainBlue">{message}</p>
          <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

