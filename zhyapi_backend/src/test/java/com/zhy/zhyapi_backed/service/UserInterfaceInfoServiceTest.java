package com.zhy.zhyapi_backed.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

@SpringBootTest
public class UserInterfaceInfoServiceTest {
    @Resource
    private UserInterfaceInfoService userInterfaceInfoService;
    @Test
    public void invokeCountTest(){
        boolean b = userInterfaceInfoService.invokeCount(1L, 1L);
        Assertions.assertTrue(b);
    }
}
