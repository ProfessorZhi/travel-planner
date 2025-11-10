# 在 GitHub 添加 Secrets 的步骤

1. 进入 GitHub 仓库 https://github.com/ProfessorZhi/travel-planner

2. 点击 "Settings" 选项卡

3. 在左侧菜单中找到 "Security" -> "Secrets and variables" -> "Actions"

4. 点击 "New repository secret" 按钮

5. 添加以下两个 secrets：

   ## ALIYUN_USERNAME
   - Name: `ALIYUN_USERNAME`
   - Secret: 从阿里云容器镜像服务获取的"镜像仓库登录名"
   
   获取方法：
   1. 登录阿里云控制台：https://cr.console.aliyun.com/
   2. 点击左侧菜单"访问凭证"
   3. 在"固定访问凭证"页面找到"镜像仓库登录名"
   
   注意：这个值应该类似于 nick2650733193，不是账号 ID

   ## ALIYUN_PASSWORD
   - Name: `ALIYUN_PASSWORD`
   - Secret: 从阿里云容器镜像服务获取的固定密码

注意：
- 确保密码中不包含特殊字符，如果有，可能需要在阿里云重新设置一个更简单的密码
- 添加后这些值将被加密，不会显示在任何日志或输出中
- 这些凭证只能由仓库管理员设置和查看