
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const AdmissionApply = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <ScrollReveal>
          <section className="py-16 bg-mainBlue text-white">
            <div className="main-container">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 reveal">입학 지원</h1>
              <p className="text-white/80 max-w-3xl reveal reveal-delay-100">
                서울대학교 정치지도자과정의 입학 지원 안내입니다.
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="main-container">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-elegant p-8 md:p-12 reveal reveal-delay-200">
                <h2 className="text-2xl md:text-3xl font-bold text-mainBlue mb-6">제 15기 (2025년 3월~8월) 지원 안내</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-mainBlue mb-3">모집 인원</h3>
                    <p className="text-gray-700">30명 내외</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-mainBlue mb-3">모집 대상</h3>
                    <p className="text-gray-700 mb-3">다음 중 하나 이상에 해당하는 전·현직자</p>
                    <ul className="list-decimal pl-5 space-y-2 text-gray-700">
                      <li>국회의원, 지방자치단체장 및 지방의회 의원</li>
                      <li>중앙정부 및 지방자치단체 고위 공무원</li>
                      <li>정당의 주요 당직자</li>
                      <li>정치, 행정, 외교 분야 관련 공공기관, 언론사, 연구소 임직원</li>
                      <li>각 분야 전문가 및 시민사회단체 대표</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-mainBlue mb-3">지원 절차</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-mainBlue mb-2">원서 교부 및 접수 기간</h4>
                        <p className="text-gray-700">2024년 12월 1일 ~ 2025년 2월 15일</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-mainBlue mb-2">원서 교부 및 접수 장소</h4>
                        <p className="text-gray-700">홈페이지(plpsnu.ne.kr)에서 다운로드, 우편 또는 이메일 접수</p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">우편 접수 주소:</span> (08826) 서울특별시 관악구 관악로 1 서울대학교 아시아연구소 517호 정치지도자과정
                        </p>
                        <p className="text-gray-700 mt-2">
                          <span className="font-medium">이메일 접수 주소:</span> plp@snu.ac.kr
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-mainBlue mb-2">제출 서류</h4>
                        <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                          <li>입학지원서</li>
                          <li>재직증명서 또는 경력증명서 1통 (이메일 접수 시, 사진 촬영 사본 제출 가능)</li>
                          <li>증명사진 1매</li>
                          <li>개인정보수집이용동의서</li>
                        </ol>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-mainBlue mb-2">서류 전형 및 면접 후 개별 통보</h4>
                        <ul className="space-y-1 text-gray-700">
                          <li><span className="font-medium">서류 전형 결과 발표:</span> 2025년 2월 20일 (합격자에 한하여 개별 통보)</li>
                          <li><span className="font-medium">면접:</span> 2025년 2월 22일 (서류 전형 합격자 대상)</li>
                          <li><span className="font-medium">최종 선정 결과 발표:</span> 2025년 2월 25일 (합격자에 한하여 개별 통보)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium text-mainBlue mb-2">등록일</h4>
                        <p className="text-gray-700">2025년 2월 26일 ~ 2025년 3월 1일</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <a 
                      href="/documents/admission-form.hwp" 
                      download 
                      className="btn-primary"
                    >
                      입학지원서 다운로드
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
};

export default AdmissionApply;
