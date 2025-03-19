import { MongoClient } from 'mongodb';
const url = 'mongodb+srv://huneykong:CDRnqjY117AkL8zs@huney-cluster.l7z1j.mongodb.net/plp_database?retryWrites=true&w=majority&appName=huney-cluster';
const client = new MongoClient(url);

async function addSampleSchedules() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('plp_database');
    const collection = db.collection('schedules');
    
    // 먼저 기존 일정 삭제
    await collection.deleteMany({});
    console.log('기존 일정 데이터 삭제 완료');
    
    // 샘플 데이터
    const sampleSchedules = [
      {
        term: 1,
        year: '2024',
        category: 'academic',
        title: '입학식',
        date: new Date('2024-03-15'),
        time: '14:00',
        location: '서울대학교 행정대학원',
        description: '제1기 입학식',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        term: 1,
        year: '2024',
        category: 'academic',
        title: '1학기 개강',
        date: new Date('2024-03-22'),
        time: '14:00',
        location: '서울대학교 행정대학원',
        description: '제1기 1학기 개강',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        term: 1,
        year: '2024',
        category: 'field',
        title: '국회 방문',
        date: new Date('2024-04-14'),
        time: '13:00',
        location: '대한민국 국회의사당',
        description: '국회 본회의장 및 상임위원회 견학',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        term: 1,
        year: '2024',
        category: 'social',
        title: '친교의 밤',
        date: new Date('2024-04-28'),
        time: '18:00',
        location: '롯데호텔 서울',
        description: '1기 원우 친목 행사',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        term: 2,
        year: '2024',
        category: 'academic',
        title: '입학식',
        date: new Date('2024-09-06'),
        time: '14:00',
        location: '서울대학교 행정대학원',
        description: '제2기 입학식',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        term: 2,
        year: '2024',
        category: 'overseas',
        title: '해외 연수',
        date: new Date('2024-11-10'),
        time: '08:00',
        location: '미국 워싱턴 D.C.',
        description: '미국 정치 제도 및 리더십 연수',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // 데이터 삽입
    const result = await collection.insertMany(sampleSchedules);
    console.log(`${result.insertedCount}개의 샘플 일정 데이터가 성공적으로 추가되었습니다.`);
  } catch (error) {
    console.error('Error adding sample schedules:', error);
  } finally {
    await client.close();
    console.log('MongoDB 연결 종료');
  }
}

addSampleSchedules(); 