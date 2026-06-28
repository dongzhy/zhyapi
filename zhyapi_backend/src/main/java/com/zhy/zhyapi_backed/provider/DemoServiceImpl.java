package com.zhy.zhyapi_backed.provider;


import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.stereotype.Component;

@DubboService
@Component
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "hello " + name;
    }

    @Override
    public String sayHello2(String name) {
        return "zhy";
    }
}
