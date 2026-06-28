package com.zhy.zhyapiclientsdk.utils;

import cn.hutool.crypto.digest.DigestUtil;

/**
 * 签名工具
 */
public class SignUtils {
    /**
     * 生成签名
     * @param body
     * @param secretKey
     * @return
     */
    public static String getSign(String body, String secretKey){
        // 5393554e94bf0eb6436f240a4fd71282
        String content = body+"."+secretKey;
        return DigestUtil.md5Hex(content);

    }
}
