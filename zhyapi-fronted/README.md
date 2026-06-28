API开放平台
项目简介
API开发平台 是一套分布式微服务 API 开放调用平台，完整实现接口统一管理、安全鉴权、流量管控、调用统计、在线调试、客户端 SDK 一体化解决方案，对标阿里云 / 腾讯云开放 API 平台，适合毕业设计、Java 后端求职实战项目。

项目背景
开发者经常需要调用第三方 API，但缺少轻量化、可私有化部署的自研接口开放平台；
原生 HTTP 调用存在鉴权复杂、重复封装、无调用统计、无安全防护等问题；
统一网关集中处理路由、鉴权、限流、日志、调用计数，剥离业务重复逻辑；
提供开箱即用 SpringBoot Starter SDK，降低开发者接入成本，无需手动实现签名、HTTP 请求。
角色
普通开发者
注册登录、自动分配 AK/SK 调用密钥，支持重置密钥； 浏览全部开放接口、查看在线文档、在线调试接口； 开通接口调用额度，查看剩余调用次数、调用流水； 引入自打包 SDK 一行代码调用平台接口。

平台管理员
接口新增、编辑、发布上线 / 下线、逻辑删除；
用户管理、批量充值接口调用次数、对账流水查询；
可视化调用统计（Top 高频接口、调用占比图表）；
核心功能
zhyapi-common 公共模块（新增补充核心模块） 跨服务通用依赖，统一存放数据库实体、Dubbo RPC 公共接口，网关、后端服务同时依赖，避免实体 / 接口重复定义：
1.1 数据库实体类
InterfaceInfo 接口信息实体
存储平台所有对外开放接口基础信息：接口名称、请求地址、请求方式、请求 / 响应头、参数、上下线状态、创建人、逻辑删除标识。
User 用户实体
存储平台账号信息，核心字段accessKey、secretKey用于接口签名鉴权，区分普通用户 / 管理员角色，支持逻辑删除。
UserInterfaceInfo 用户接口关联实体
用户与接口多对多关联表，记录每个用户对应接口的总调用次数、剩余调用次数、状态，作为额度管控核心数据表。
1.2 Dubbo 内部 RPC 公共接口（网关远程调用后端）
InnerUserService：根据 accessKey 查询用户完整信息，网关鉴权使用； InnerInterfaceInfoService：根据请求路径 + 请求方法查询接口是否存在、是否上线； InnerUserInterfaceInfoService：接口调用成功后，执行调用次数自增逻辑。
API 网关模块（zhyapi-gateway，端口 8090） 基于 Spring Cloud Gateway 响应式网关，统一入口拦截所有接口请求，集中处理横向切面逻辑： 请求路由转发、负载均衡； 全局 IP 黑白名单访问控制； AK/SK MD5 签名鉴权、防重放攻击（nonce 随机数 + timestamp 时间戳校验）； 请求 / 响应全链路日志打印； 调用成功后自动统计调用次数（响应装饰器异步后置处理）； 统一跨域、流量染色、请求过滤； Dubbo RPC 调用后端服务，解耦数据库操作。
业务后端管理模块（zhyapi-backend，端口 8101） 平台核心业务服务，Dubbo 服务提供者，提供完整 CRUD 与业务逻辑： 用户模块：注册、登录、微信开放平台登录、注销、AK/SK 密钥生成 / 重置； 接口管理模块：新增 / 删除 / 更新 / 上线 / 下线、在线调试、接口参数校验； 用户 - 接口关联模块：分配调用次数、批量充值、额度查询、调用流水记录； 数据分析模块：查询 TopN 高频调用接口，提供 ECharts 可视化数据接口； 权限校验：自定义注解@AuthCheck区分管理员 / 普通用户权限； Knife4j 接口文档、MyBatis-Plus 逻辑删除、全局异常处理。 接口文档访问地址：http://localhost:8101/api/doc.html，若访问提示 URL 拼写错误，请检查服务启动状态与上下文路径配置。
模拟接口服务（zhy-interface-example，端口 8123） 平台内置测试接口服务，提供三种标准 HTTP 接口用于演示调用流程： GET 普通传参接口； POST 表单 URL 传参接口； POST JSON Restful 请求接口； 模拟第三方业务接口，供平台网关转发调试。
客户端 SDK（zhyapi-client-sdk，SpringBoot Starter） 封装全部鉴权、HTTP 请求逻辑，开发者零成本接入： 内置签名工具类SignUtils，自动生成 MD5 签名； 封装ZhyApiClient统一 HTTP 请求工具（基于 Hutool Http）； SpringBoot 自动配置ZhyApiClientConfig，yml 配置 AK/SK 自动注入客户端 Bean； 支持 GET / 表单 POST / JSON POST 三种请求方式； 可打包发布至 Maven 私有仓库，外部项目直接引入依赖使用。
前端项目（ant-design-pro + React + Umi） 前台开发者门户：接口列表、在线调试、个人密钥管理、我的调用额度； 管理员后台：接口管理、用户管理、调用统计可视化、充值流水； OpenAPI 插件自动根据后端 Swagger 生成前端接口请求代码； ECharts 实现接口调用饼图、Top 排行图表展示。
核心技术亮点
网关统一鉴权与计数：GlobalFilter 全局过滤器，后置装饰 Response 实现调用次数统计，避免单体 AOP 局限；
AK/SK 签名防重放：accessKey 标识用户、secretKey 私钥加密，随机数 + 5 分钟时间戳拦截恶意重放；
Dubbo + Nacos 微服务拆分：网关无数据库依赖，通过 RPC 远程调用后端业务，职责分离；
自定义 SpringBoot Starter SDK：自动配置、一键注入客户端，简化第三方接入；
多角色权限控制：注解式权限拦截，区分普通用户 / 管理员操作；
在线接口调试：前端传参→后端中转调用模拟接口，前端不直接请求下游，安全规范；
调用额度管控：用户 - 接口多对多关系表，记录总调用次数、剩余次数，支持批量充值；
数据可视化统计：SQL 分组聚合查询高频接口，前端 ECharts 图表展示；
企业级基础能力：逻辑删除、全局异常、参数校验、分布式会话、微信登录、对象存储预留。
快速启动指南
前置环境
JDK 8+
Maven 3.6+
MySQL 8.0
Nacos 2.1.0（standalone 单机模式）
Node.js 16+（前端启动） 步骤 1：初始化数据库 执行doc/sql/zhyapi_db.sql创建库与数据表，修改后端application.yml数据库账号密码。 步骤 2：启动 Nacos 注册中心 bash 运行
windows
startup.cmd -m standalone

linux/mac
sh startup.sh -m standalone 访问：http://localhost:8848/nacos 步骤 3：打包 SDK（必须先执行） bash 运行 cd zhyapi-client-sdk mvn clean install 打包后其他模块可直接引入该 SDK 依赖。 步骤 4：启动后端服务（Dubbo 提供者） bash 运行 cd zhyapi-backend mvn spring-boot:run

访问接口文档：http://localhost:8101/api/doc.html
步骤 5：启动模拟接口服务 bash 运行 cd zhy-interface-example mvn spring-boot:run

服务地址：http://localhost:8123/api
步骤 6：启动 API 网关（Dubbo 消费者） bash 运行 cd zhyapi-gateway mvn spring-boot:run

网关统一入口：http://localhost:8090/api
步骤 7：启动前端 bash 运行 cd zhyapi-frontend npm install npm run dev

SDK 使用示例（开发者接入）

Maven 引入依赖 xml com.zhy zhyapi-client-sdk 1.0.0
yml 配置 AK/SK yaml zhyapi: client: access-key: 你的用户AK secret-key: 你的用户SK
}

运行截图
主页 img.png 接口详情页 img_1.png 我的接口额度 img_2.png 密钥管理 img_3.png 接口管理 img_4.png

接口分析【现有接口调用次数】 img_5.png 用户接口额度管理 img_6.png

充值对账记录 img_7.png

项目遗留问题与待优化方向
受开发周期、个人学习阶段限制，本项目仍存在较多可优化、待完善的缺陷，欢迎各位开发者 Fork 二次改造、提交 PR 共同完善：

一、安全层面缺陷
防重放机制不完善:当前仅通过 nonce 随机数、时间戳做基础校验，未使用 Redis 存储已使用的随机数，同一随机数短时间内可重复发起请求，存在重放攻击漏洞；
限流、熔断能力缺失:网关未接入 Redis 实现分布式限流（漏桶 / 令牌桶算法），无接口熔断、降级兜底策略，高并发场景下易出现下游服务雪崩；
密钥更新无通知机制:用户重置 AK/SK 后无缓存清除逻辑，网关内存未做缓存，并发场景下可能短暂使用旧密钥鉴权；
IP 黑白名单硬编码:网关 IP 白名单写死在代码中，未提供后台管理页面动态配置，无法在线新增 / 删除放行 IP。
二、分布式与性能问题
调用次数统计无分布式锁 :多网关实例并发调用同一接口时，invokeCount 次数自增存在并发超卖、计数不准问题，未使用 Redis 分布式锁或数据库乐观锁；
无全局缓存设计:接口基础信息、用户 AK/SK 每次请求都走 Dubbo 查询数据库，高频调用下数据库压力大，缺少 Redis 热点数据缓存；
无分布式链路追踪:未接入 SkyWalking/Sleuth 链路追踪，线上接口报错无法快速定位完整调用链路，仅靠本地日志排查；
三、业务功能短板
第三方接口自主接入功能未完整实现:仅预留 host 字段，无前端页面、后端校验逻辑，外部开发者无法自助上传自己的业务接口；
在线调试功能单一 :仅支持简单 JSON 参数传入，不支持文件上传、Header 自定义、Cookie 携带、分页参数调试；
数据统计维度简陋:仅提供 Top3 高频接口查询，无按时间、用户、接口分组统计、日 / 月调用报表、导出 Excel 功能；
充值流水缺少对账校验:批量充值仅记录操作记录，无余额校验、回滚机制，异常场景下可能出现额度错乱。
四、工程与架构缺陷
异常处理不完善 :网关、Dubbo 远程调用异常仅简单打印日志，无统一错误码封装、全局告警推送（邮件 / 钉钉）；
缺少灰度发布、流量染色完整逻辑 :网关仅预留流量染色请求头，未实现按用户 / 比例灰度分流、版本隔离；
数据库无分库分表、索引优化 :调用流水、充值日志单表存储，长期大量数据会导致查询缓慢，未设计分表策略；部分业务查询缺少联合索引。
五、部署与运维不足
无定时清理任务
过期随机数、过期调用日志、失效充值流水未做定时清理，数据量持续膨胀；
监控告警体系空白
未对接 Prometheus + Grafana 监控网关 QPS、接口耗时、数据库连接池、Dubbo 调用成功率。
欢迎共建
本项目完全开源，支持任意二次改造、毕业设计修改、商用二次开发：
若你修复上述缺陷、新增功能，可提交 Issues / Pull Request 至仓库；
有功能需求、思路优化建议，可在 GitHub 提交讨论；
学习过程中遇到启动报错、逻辑疑问，可提交 Issue 留言，作者会定期回复。
