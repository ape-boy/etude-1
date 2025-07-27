package com.ssss.devportal.ai.admin.mapper;

import com.ssss.devportal.ai.admin.entity.PersonaPromptEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * swp_chatops_persona_prompt 테이블 매퍼
 * 히스토리 관리: UPDATE 없이 INSERT만 사용, 최신 PROMPT_ID로 LOAD
 */
@Mapper
public interface PersonaPromptMapper {

    /**
     * 새 프롬프트 삽입 (히스토리 관리용)
     * @param entity 프롬프트 엔티티
     * @return 삽입된 행 수
     */
    int insertPersonaPrompt(PersonaPromptEntity entity);

    /**
     * 특정 페르소나의 최신 프롬프트 조회
     * @param personaCode 페르소나 코드
     * @param promptType 프롬프트 타입 (기본: PERSONA)
     * @return 최신 프롬프트 엔티티
     */
    PersonaPromptEntity findLatestByPersonaCode(
            @Param("personaCode") String personaCode,
            @Param("promptType") String promptType
    );

    /**
     * 모든 페르소나의 최신 프롬프트 목록 조회
     * @param promptType 프롬프트 타입 (기본: PERSONA)
     * @return 최신 프롬프트 엔티티 목록
     */
    List<PersonaPromptEntity> findAllLatestPrompts(@Param("promptType") String promptType);

    /**
     * 페르소나 존재 여부 확인 (최신 버전 기준)
     * @param personaCode 페르소나 코드
     * @param promptType 프롬프트 타입
     * @return 존재 여부
     */
    boolean existsByPersonaCode(
            @Param("personaCode") String personaCode,
            @Param("promptType") String promptType
    );

    /**
     * 특정 페르소나의 프롬프트 히스토리 조회
     * @param personaCode 페르소나 코드
     * @param promptType 프롬프트 타입
     * @param limit 조회 제한 개수
     * @return 히스토리 목록 (최신순)
     */
    List<PersonaPromptEntity> findHistoryByPersonaCode(
            @Param("personaCode") String personaCode,
            @Param("promptType") String promptType,
            @Param("limit") int limit
    );

    /**
     * 페르소나별 프롬프트 개수 조회 (히스토리 포함)
     * @param personaCode 페르소나 코드
     * @param promptType 프롬프트 타입
     * @return 프롬프트 개수
     */
    int countByPersonaCode(
            @Param("personaCode") String personaCode,
            @Param("promptType") String promptType
    );

    /**
     * 전체 페르소나 코드 목록 조회 (중복 제거)
     * @param promptType 프롬프트 타입
     * @return 페르소나 코드 목록
     */
    List<String> findAllPersonaCodes(@Param("promptType") String promptType);

    /**
     * 특정 기간 내 생성된 프롬프트 조회
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @param promptType 프롬프트 타입
     * @return 프롬프트 목록
     */
    List<PersonaPromptEntity> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("promptType") String promptType
    );

    /**
     * 페르소나 코드로 검색 (부분 일치)
     * @param keyword 검색 키워드
     * @param promptType 프롬프트 타입
     * @return 최신 프롬프트 목록
     */
    List<PersonaPromptEntity> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("promptType") String promptType
    );

    /**
     * 오래된 히스토리 정리 (특정 개수 이상의 히스토리 삭제)
     * @param personaCode 페르소나 코드
     * @param promptType 프롬프트 타입
     * @param keepCount 유지할 히스토리 개수
     * @return 삭제된 행 수
     */
    int cleanupOldHistory(
            @Param("personaCode") String personaCode,
            @Param("promptType") String promptType,
            @Param("keepCount") int keepCount
    );
}