package com.ssss.devportal.ai.admin.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * MyBatis 설정 클래스
 * ChatOps Admin 데이터베이스 연결 및 매퍼 설정
 */
@Configuration
@EnableTransactionManagement
@MapperScan(
    basePackages = "com.ssss.devportal.ai.admin.mapper",
    sqlSessionFactoryRef = "chatOpsSqlSessionFactory"
)
public class MyBatisConfig {

    /**
     * ChatOps 데이터소스 설정
     * application.yml에서 설정값 로드
     */
    @Primary
    @Bean(name = "chatOpsDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.chatops")
    public DataSource chatOpsDataSource() {
        // 실제 환경에서는 application.yml에서 다음과 같은 설정 필요:
        /*
        spring:
          datasource:
            chatops:
              driver-class-name: com.mysql.cj.jdbc.Driver
              url: jdbc:mysql://localhost:3306/chatops_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
              username: chatops_user
              password: your_password
              hikari:
                maximum-pool-size: 20
                minimum-idle: 5
                connection-timeout: 30000
                idle-timeout: 600000
                max-lifetime: 1800000
         */
        
        return DataSourceBuilder.create().build();
    }

    /**
     * ChatOps SqlSessionFactory 설정
     */
    @Primary
    @Bean(name = "chatOpsSqlSessionFactory")
    public SqlSessionFactory chatOpsSqlSessionFactory(
            @Qualifier("chatOpsDataSource") DataSource dataSource) throws Exception {
        
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        
        // MyBatis 설정
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true); // snake_case to camelCase 자동 변환
        configuration.setCallSettersOnNulls(true); // null 값도 setter 호출
        configuration.setJdbcTypeForNull(org.apache.ibatis.type.JdbcType.NULL);
        configuration.setLogImpl(org.apache.ibatis.logging.slf4j.Slf4jImpl.class); // SQL 로깅
        
        sessionFactory.setConfiguration(configuration);
        
        // 매퍼 XML 파일 위치 설정
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sessionFactory.setMapperLocations(
            resolver.getResources("classpath:mybatis/*-mapper.xml")
        );
        
        // 타입 별칭 설정 (Entity 패키지)
        sessionFactory.setTypeAliasesPackage("com.ssss.devportal.ai.admin.entity");
        
        return sessionFactory.getObject();
    }

    /**
     * ChatOps SqlSessionTemplate 설정
     */
    @Primary
    @Bean(name = "chatOpsSqlSessionTemplate")
    public SqlSessionTemplate chatOpsSqlSessionTemplate(
            @Qualifier("chatOpsSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    /**
     * ChatOps 트랜잭션 매니저 설정
     */
    @Primary
    @Bean(name = "chatOpsTransactionManager")
    public DataSourceTransactionManager chatOpsTransactionManager(
            @Qualifier("chatOpsDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}

/**
 * 개발/테스트용 H2 인메모리 데이터베이스 설정 (선택사항)
 * 실제 운영에서는 제거하고 MySQL만 사용
 */
/*
@Configuration
@Profile({"dev", "test"})
public static class H2TestConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.h2")
    public DataSource h2DataSource() {
        return DataSourceBuilder.create()
            .driverClassName("org.h2.Driver")
            .url("jdbc:h2:mem:chatops_test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
            .username("sa")
            .password("")
            .build();
    }
    
    @PostConstruct
    public void initializeH2Database() {
        // H2 테스트 데이터베이스 초기화 SQL
        // CREATE TABLE, INSERT 구문 등 실행
    }
}
*/