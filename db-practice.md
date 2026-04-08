# DB - 실습

## DDL 실습

### 문제 1: 테이블 생성하기

1. attendance 테이블은 중복된 데이터가 쌓이는 구조이다. 중복된 데이터는 어떤 컬럼인가?
    - crew_id, nickname이 중복된다.

2. attendance 테이블에서 중복을 제거하기 위해 crew 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
    - 컬럼이 crew_id와 nickname인 테이블

3. crew 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)
    ```mysql
    SELECT DISTINCT crew_id, nickname
    FROM attendance;
   ```

4. 최종적으로 crew 테이블 생성:
    ```mysql
    CREATE TABLE crew (
        `crew_id` INT NOT NULL,
        `nickname` VARCHAR(50) NOT NULL,
        PRIMARY KEY (`crew_id`)
        );
    ```

5. attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기:
    ```mysql
    INSERT INTO crew (crew_id, nickname)
    SELECT DISTINCT crew_id, nickname
    FROM attendance;
    ```

### 문제 2: 테이블 컬럼 삭제하기

1. crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?
    - nickname
2. 컬럼을 삭제하려면 어떻게 해야 하는가?
    ```mysql
    ALTER TABLE attendance
    DROP COLUMN nickname;
   ```

### 문제 3: 외래키 설정하기
```mysql
ALTER TABLE attendance 
ADD FOREIGN KEY (crew_id) 
REFERENCES crew(crew_id);
```

### 문제 4: 유니크 키 설정
```mysql
ALTER TABLE crew
ADD UNIQUE (nickname);
```

## DML (CRUD) 실습

### 문제 5: 크루 닉네임 검색하기
```mysql
SELECT nickname
FROM crew
WHERE nickname LIKE '디%';
```

### 문제 6: 출석 기록 확인하기
```mysql
SELECT crew_id
FROM crew
WHERE nickname LIKE '어셔';
```
존재 x

### 문제 7: 누락된 출석 기록 추가
```mysql
INSERT INTO crew (crew_id, nickname)
VALUES (13, '어셔');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31', '18:01');
```

### 문제 8: 잘못된 출석 기록 수정
```mysql
INSERT INTO crew (crew_id, nickname) 
VALUES (14, '주니');
```
주니 추가
```mysql
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time) 
VALUES (14, '2025-03-12', '10:05', '18:00'); 
```
주니 출석 추가
```mysql
UPDATE attendance
SET start_time = '10:00'
WHERE crew_id = 14 AND attendance_date = '2025-03-12';
```
주니 출석 갱신

### 문제 9: 허위 출석 기록 삭제

```mysql
INSERT INTO crew (crew_id, nickname) 
VALUES (15, '아론');
```
아론 추가
```mysql
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time) 
VALUES (15, '2025-03-12', '10:00', '18:00'); 
```
아론 출석 추가
```mysql
DELETE FROM attendance
WHERE crew_id = 15 AND attendance_date = '2025-03-12';
```

### 문제 10: 출석 정보 조회하기
```mysql
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM crew AS c
INNER JOIN attendance AS a ON c.crew_id = a.crew_id;
```

### 문제 11: nickname으로 쿼리 처리하기
```mysql
SELECT * FROM attendance 
WHERE crew_id = ( SELECT crew_id FROM crew WHERE nickname = '검프' );
```

### 문제 12: 가장 늦게 하교한 크루 찾기
```mysql
SELECT c.nickname, a.end_time
FROM crew AS c
INNER JOIN attendance AS a ON c.crew_id = a.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 집계 함수 실습

### 문제 13: 크루별로 '기록된' 날짜 수 조회
```mysql
SELECT crew_id, COUNT(attendance_date)
FROM attendance
GROUP BY crew_id;
```

### 문제 14: 크루별로 등교 기록이 있는 (start_time IS NOT NULL) 날짜 수 조회
```mysql
SELECT crew_id, count(attendance_date)
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY crew_id;
```

### 문제 15: 날짜별로 등교한 크루 수 조회
```mysql
SELECT attendance_date, count(crew_id)
FROM attendance
GROUP BY attendance_date;
```
### 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)
```mysql
SELECT crew_id, MIN(start_time), MAX(start_time)
FROM attendance
GROUP BY crew_id;
```
## 생각해 보기

### 1. SQL 실습 관련

1. 기본키란 무엇이고 왜 필요한가?
    - 테이블에서 각 레코드를 유일하게 식별하는 값
    - 특정 데이터를 찾기 위해, 다른 테이블과 관계를 맺기 위해, 데이터 중복/혼동 방지하기 위해 필요하다.
2. MySQL에서 사용되는 AUTO_INCREMENT는 왜 필요할까?
    - 고유한 ID를 자동으로 생성해주는 기능
    - 고유값 생성 책임을 DB에 맡기면, 인간의 실수 가능성을 차단할 수 있다.
3. 학생이 등교는 했지만 하교 버튼을 누르지 않았을 때, end_time에 NULL이 저장된다. NULL 값을 처리할 때 주의할 점은?
    - 아직 하교하지 않은 데이터이다.
    - 일반 값처럼 처리하면 안 되고, 비즈니스 로직에서 별도의 상태로 분기하여 처리해야 한다.
4. crew와 attendance 테이블의 관계를 ER 다이어그램으로 시각화해보자. 이 관계를 일상 생활의 예시로 비유한다면 어떤 것이 있을까?
    - 1:N 관계
    - 사람 1명 : 출퇴근 기록 여러 개
    - 비유 : 마을 1개 - 크루원 여러 명

### 2. DB 개념 연결

5. 출석 시스템에서 동시에 100명이 등교 버튼을 누른다면 어떤 일이 일어날까? 이 문제를 2026 공통강의 - DB에서 배운 트랜잭션과 ACID 속성으로 설명해보자.
    - atomic 
    - 동일한 데이터가 중복 저장
    - 일부만 저장되고 중간에 실패 (데이터 깨짐)
    - 서로의 작업을 덮어씀 (Race Condition)
6. 출석 데이터가 파일(CSV)이 아닌 데이터베이스에 저장되는 이유는 무엇일까? 파일 시스템으로 출석을 관리했다면 어떤 문제가 생길까?
    - 파일 시스템
        - 여러 명이 동시에 파일을 쓰면 충돌 발생 (파일 깨짐)
        - 파일이 여러 개로 나뉘면 관리 어려움
        - 전체 파일 스캔 필요
    - DB
        - 트랜잭션 지원
        - 동시성 제어
        - 인덱스를 통한 빠른 조회
        - 무결성 보장
3. 출석 데이터를 관계형 DB가 아닌 NoSQL(예: MongoDB)로 저장한다면 테이블 구조가 어떻게 달라질까? 어떤 장단점이 있을까?
    - JOIN 없이 조회 가능 → 빠름
    - 구조 유연 (필드 추가 쉬움)
    - JSON 형태 그대로 사용 가능


## 3. 더 생각해 보기 (심화)

1. 왜 crew 테이블에서 nickname을 기본키로 하지 않은 걸까? attendance 테이블에 attendance_id가 존재하는 이유는 무엇일까?
    - 업무적 의미가 있는 값은 변할 수 있기 때문에 PK로 부적합하고, 안정적인 대리키를 사용한다.
    - 각 출석 기록을 명확하게 식별하기 위해 별도의 대리키를 둔다.
2. 데이터베이스 제약 조건 중 RESTRICT, CASCADE는 무엇인가?
    - RESTRICT:  참조하는 데이터가 남아있으면 원본을 삭제하지 못하게 막는다.
    - CASCADE: 원본이 삭제되면 그에 딸린 모든 데이터를 함께 자동 삭제한다.
3. 다음 두 쿼리는 동일한 결과를 반환하지만 성능에 차이가 있다. 어떤 차이가 있으며, 어떤 상황에서 각각 유리할까?
    ```
    -- 쿼리 1: 서브쿼리 사용
    SELECT * FROM attendance WHERE crew_id IN (SELECT crew_id FROM crew WHERE nickname LIKE '네%');
    
    -- 쿼리 2: JOIN 사용
    SELECT a.* FROM attendance a JOIN crew c ON a.crew_id = c.crew_id WHERE c.nickname LIKE '네%';
    ```
    - 서브쿼리
        - 내부 쿼리 먼저 실행 → 결과 집합 생성.
        - 경우에 따라 비효율적 (특히 큰 데이터)
        - 간단한 작업에서 좋음.
    - JOIN
        - 옵티마이저가 조인 순서/인덱스 최적화 가능
        - 일반적으로 더 빠름
        - 대부분의 경우에서 유리함.

4. attendance 테이블을 완전히 정규화하면 어떤 장점이 있을까? 반대로 일부 비정규화를 적용한다면 어떤 쿼리 성능 이점을 얻을 수 있을까?
    - 정규화 장점
        - 데이터 중복 제거
        - 일관성 유지
        - 업데이트 시 안정성
    - 비정규화 장점
        - JOIN 줄어듦 → 조회 속도 향상
        - 읽기 성능 개선

5. 출석 시스템이 수백 명의 사용자에 의해 동시에 접근된다면, 연결 풀링(connection pooling)은 무엇이고 왜 필요한가?
    - 미리 연결을 만들어두고 재사용하는 방식
    - 요청마다 연결 생성하면 느리기 때문에 필요하다.

6. 실습에서 수행한 INSERT, UPDATE, DELETE를 하나의 트랜잭션으로 묶는다면 어떻게 작성할 수 있을까? 만약 DELETE 도중 오류가 발생하면 앞서 수행한 INSERT와 UPDATE는 어떻게 되어야 할까?
    - 예시
    ```
    START TRANSACTION;

    INSERT INTO attendance ...;
    UPDATE crew ...;
    DELETE FROM attendance ...;

    COMMIT;
    ```
    - 중간에 오류 발생하면 데이터 불일치가 발생하기 때문에 전체 작업을 취소해야한다.