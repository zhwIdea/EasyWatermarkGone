document.addEventListener('DOMContentLoaded', function() {
    const passwordContainer = document.getElementById('password-container');
    const mainContainer = document.getElementById('main-container');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordError = document.getElementById('password-error');
    const videoUrl = document.getElementById('video-url');
    const parseBtn = document.getElementById('parse-btn');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const videoTitle = document.getElementById('video-title');
    const videoCover = document.getElementById('video-cover');
    const downloadVideo = document.getElementById('download-video');
    const downloadCover = document.getElementById('download-cover');
    const closeModalBtn = document.querySelector('.close-modal');
    const downloadModal = document.getElementById('download-modal');

    // 密码验证功能
    passwordSubmit.addEventListener('click', function() {
        validatePassword();
    });

    // 密码输入框回车验证
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            validatePassword();
        }
    });

    function validatePassword() {
        const password = passwordInput.value.trim();
        const correctPassword = '123456';

        if (password === correctPassword) {
            passwordContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            // 保存登录状态到本地存储，24小时有效
            const expireTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('authExpire', expireTime);
        } else {
            passwordError.textContent = '密码错误，请重试';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // 检查是否已经登录
    function checkAuth() {
        const authExpire = localStorage.getItem('authExpire');
        if (authExpire && new Date().getTime() < parseInt(authExpire)) {
            passwordContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
        }
    }

    // 页面加载时检查登录状态
    checkAuth();

    // 视频解析功能
    parseBtn.addEventListener('click', function() {
        parseVideo();
    });

    videoUrl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            parseVideo();
        }
    });

    function parseVideo() {
        const videoUrlValue = videoUrl.value.trim();
        if (!videoUrlValue) {
            showError('请输入视频链接');
            videoUrl.focus();
            return;
        }

        // 验证URL格式
        if (!isValidUrl(videoUrlValue)) {
            showError('请输入有效的视频链接');
            videoUrl.focus();
            return;
        }

        // 显示加载状态
        parseBtn.disabled = true;
        parseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 解析中';
        errorMessage.textContent = '';
        resultContainer.classList.add('hidden');
        
        // 显示临时提示
        showTemporaryMessage('正在解析视频，请稍候...');

        // 调用API解析视频
        fetch(`https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk?ak=87992e659e1c4321957190be4fc7be01&link=${encodeURIComponent(videoUrlValue)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            parseBtn.disabled = false;
            parseBtn.innerHTML = '解析';

            if (data.code === '10000' && data.content && data.content.success) {
                displayResult(data.content);
            } else {
                showError(data.msg || '解析失败，请检查链接是否正确');
            }
        })
        .catch(error => {
            parseBtn.disabled = false;
            parseBtn.innerHTML = '解析';
            showError('网络错误，请稍后重试');
            console.error('Error:', error);
        });
    }

    function displayResult(content) {
        // 显示视频信息
        videoTitle.textContent = content.title || '未知标题';
        
        // 设置封面图片
        if (content.cover) {
            videoCover.src = content.cover.trim();
            downloadCover.href = content.cover.trim();
            downloadCover.download = 'cover.jpg';
        }
        
        // 设置视频下载链接
        if (content.url) {
            downloadVideo.href = content.url.trim();
            downloadVideo.download = 'video.mp4';
        }
        
        // 显示结果容器
        resultContainer.classList.remove('hidden');
        resultContainer.classList.add('fade-in');
        
        // 显示成功消息
        showSuccess('解析成功！可以下载视频和封面了');
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.color = '#e74c3c';
        // 添加抖动动画
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }
    
    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.color = '#2ecc71';
    }
    
    function showTemporaryMessage(message) {
        showSuccess(message);
        setTimeout(() => {
            if (errorMessage.style.color === 'rgb(46, 204, 113)') { // 只有在成功消息时才清除
                errorMessage.textContent = '';
            }
        }, 3000);
    }
    
    function isValidUrl(string) {
        try {
            // 检查是否包含常见视频平台域名
            const platforms = ['douyin.com', 'kuaishou.com', 'weibo.com', 'bilibili.com', 'ixigua.com'];
            return platforms.some(platform => string.includes(platform)) || new URL(string).protocol.startsWith('http');
        } catch (err) {
            return false;
        }
    }

    // 下载功能增强
    downloadVideo.addEventListener('click', function(e) {
        handleDownload(e, this.href, 'video.mp4');
    });

    downloadCover.addEventListener('click', function(e) {
        handleDownload(e, this.href, 'cover.jpg');
    });
    
    // 关闭模态框按钮事件
    closeModalBtn.addEventListener('click', closeModal);

    function handleDownload(e, url, filename) {
        // 对于某些浏览器，直接设置download属性可能不起作用
        // 这里使用Blob方式下载
        e.preventDefault();
        
        // 获取模态框和进度条元素
        const downloadModal = document.getElementById('download-modal');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const downloadStatus = document.getElementById('download-status');
        
        // 显示模态框
        downloadModal.classList.remove('hidden');
        downloadModal.classList.add('show');
        
        // 重置进度条
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        downloadStatus.textContent = `正在下载 ${filename}...`;
        
        // 使用XMLHttpRequest以支持进度监控
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        
        // 监听下载进度
        xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressText.textContent = percentComplete + '%';
                
                // 更新状态文本
                if (percentComplete < 100) {
                    downloadStatus.textContent = `正在下载 ${filename}... ${formatFileSize(event.loaded)} / ${formatFileSize(event.total)}`;
                } else {
                    downloadStatus.textContent = '下载完成，准备保存文件...';
                }
            }
        };
        
        xhr.onload = function() {
            if (this.status === 200) {
                // 下载完成
                progressBar.style.width = '100%';
                progressText.textContent = '100%';
                downloadStatus.textContent = '下载完成！';
                
                // 创建下载链接
                const blob = this.response;
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
                
                // 2秒后关闭模态框
                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
        };
        
        xhr.onerror = function() {
            console.error('Download error');
            showError('下载失败，请稍后重试');
            downloadStatus.textContent = '下载失败，请稍后重试';
            
            // 2秒后关闭模态框
            setTimeout(() => {
                closeModal();
            }, 2000);
        };
        
        xhr.send();
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 关闭模态框
     function closeModal() {
         const downloadModal = document.getElementById('download-modal');
         downloadModal.classList.remove('show');
         setTimeout(() => {
             downloadModal.classList.add('hidden');
         }, 300);
     }
});