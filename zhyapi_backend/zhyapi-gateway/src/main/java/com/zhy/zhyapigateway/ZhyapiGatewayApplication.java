package com.zhy.zhyapigateway;

import com.zhy.zhyapi_backed.provider.DemoService;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication(exclude = {
        DataSourceAutoConfiguration.class, // 核心：排除数据源自动配置（最关键）
        DataSourceTransactionManagerAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class, // 排除JPA/MyBatis等ORM框架的自动配置
})
@EnableDubbo

public class ZhyapiGatewayApplication {
    @DubboReference
    private DemoService demoService;

    public static void main(String[] args) throws InterruptedException {
        // 启动Spring容器
        ConfigurableApplicationContext context = SpringApplication.run(ZhyapiGatewayApplication.class, args);
        ZhyapiGatewayApplication application = context.getBean(ZhyapiGatewayApplication.class);

        // 延迟5秒，给Dubbo足够时间订阅服务
        System.out.println("等待Dubbo完成Nacos服务订阅...");
        Thread.sleep(5000);

        // 调用Dubbo方法
        try {
            String result = application.doSayHello("world");
            String result2 = application.doSayHello2("world");
            System.out.println("result1: " + result);
            System.out.println("result2: " + result2);
        } catch (Exception e) {
            System.err.println("调用失败：" + e.getMessage());
            e.printStackTrace();
        }
    }

    public String doSayHello(String name) {
        return demoService.sayHello(name);
    }

    public String doSayHello2(String name) {
        return demoService.sayHello2(name);
    }
}