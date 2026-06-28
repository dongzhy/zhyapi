package com.zhy.zhyapiclientsdk;

import com.zhy.zhyapiclientsdk.client.ZhyApiClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("zhyapi.client")
@Data
@ComponentScan
public class ZhyApiClientConfig {
    private String accessKey;
    private String secretKey;
    @Bean
    public ZhyApiClient zhyApiClient() {
        return new ZhyApiClient(accessKey, secretKey);
    }
}
