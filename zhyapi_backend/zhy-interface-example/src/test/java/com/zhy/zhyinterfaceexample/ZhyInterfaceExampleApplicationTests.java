package com.zhy.zhyinterfaceexample;

import com.zhy.zhyapiclientsdk.client.ZhyApiClient;
import com.zhy.zhyapiclientsdk.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

@SpringBootTest
class ZhyInterfaceExampleApplicationTests {
    @Resource
    private ZhyApiClient zhyApiClient;

    @Test
    void contextLoads() {
        String result = zhyApiClient.getNameByGet("zhy");
        User user = new User();
        user.setUsername("zhy");
        String nameByPost = zhyApiClient.getUserNameByPost(user);
        System.out.println(result);
        System.out.println(nameByPost);
    }

}
