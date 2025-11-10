# 在 GitHub 添加 Secrets 的步骤

1. 进入 GitHub 仓库 https://github.com/ProfessorZhi/travel-planner

2. 点击 "Settings" 选项卡

3. 在左侧菜单中找到 "Security" -> "Secrets and variables" -> "Actions"

4. 点击 "New repository secret" 按钮

5. 添加以下两个 secrets：

   ## ALIYUN_USERNAME
   - Name: `ALIYUN_USERNAME`
   - Secret: 从阿里云容器镜像服务获取的访问凭证用户名（通常是您的阿里云账号全名）

   ## ALIYUN_PASSWORD
   - Name: `ALIYUN_PASSWORD`
   - Secret: 从阿里云容器镜像服务获取的固定密码

注意：
- 确保密码中不包含特殊字符，如果有，可能需要在阿里云重新设置一个更简单的密码
- 添加后这些值将被加密，不会显示在任何日志或输出中
- 这些凭证只能由仓库管理员设置和查看