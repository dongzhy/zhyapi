package com.zhy.zhyinterfaceexample.controller;

import com.zhy.zhyapiclientsdk.model.User;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

/**
 * 名称API
 */
@RestController
@RequestMapping("/name")

public class NameController {
    @GetMapping("/")
    public String getNameByGet(String name,HttpServletRequest request){
        System.out.println(request.getHeader("zhy"));

        return "你的名字是"+name;
    }
    @PostMapping("/post")
    public String getNameByPost(@RequestParam String name){
        return  "POST 你的名字是"+name;
    }

    @PostMapping("/user")
    public String getUserNameByPost(@RequestBody User user, HttpServletRequest request){
        /*String accessKey = request.getHeader("accessKey");
        String nonce = request.getHeader("nonce");
        String timestamp = request.getHeader("timestamp");
        String sign = request.getHeader("sign");
        String body = request.getHeader("body");
      //todo 实际去数据库中查询是否分配给用户
        *//*if (!accessKey.equals("zhy")){
            throw new RuntimeException("无权限");
        }*//*
        if (Long.parseLong(nonce)>10000){
            throw new RuntimeException("无权限");
        }
        //todo 时间和当前时间不能超过5分钟
        *//*if (timestamp){

        }*//*
        //todo 实际情况从数据库查出
        String serverSign = SignUtils.getSign(body, "abcdefgh");
        if (!sign.equals(serverSign)){
            throw new RuntimeException("无权限");
        }
*/
        //todo 调用成功后，次数+1
        String result ="POST 用户名是"+ user.getUsername();

        return  result;
    }

}
