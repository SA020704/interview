<template>
    <div class="voice-recorder-container">
        <!-- 录音控制区域 -->
        <div class="voice-control-header">
            <div class="voice-title">
                <h3>{{ title }}</h3>
                <p
                    v-if="showRedo && (voiceStatus === 3 || voiceStatus === 4)"
                    class="redo-btn"
                    @click="handleVoiceRedo"
                >
                    {{ redoText }}
                </p>
            </div>
            <span class="voice-tips">{{ tips }}</span>
        </div>

        <!-- 录音主体区域 -->
        <div class="record-content" @click="handleVoiceStep">
            <div class="record-btn" :class="{ disabled: voiceStatus === 1 }">
                <!-- 音频播放器 (隐藏) -->
                <audio
                    v-if="voiceUrl"
                    controls
                    style="display: none"
                    ref="voiceAudio"
                    @timeupdate="updateCurrentTime"
                    :src="voiceUrl"
                ></audio>

                <!-- 录音按钮图标 - 根据状态显示不同图标 -->
                <div class="start-btn">
                    <!-- 开始录音图标 -->
                    <div v-if="voiceStatus === 1" class="icon-start">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                        </svg>
                    </div>

                    <!-- 停止录音图标 -->
                    <div v-if="voiceStatus === 2" class="icon-stop">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <rect x="8" y="8" width="8" height="8" fill="currentColor"></rect>
                        </svg>
                    </div>

                    <!-- 播放录音图标 -->
                    <div v-if="voiceStatus === 3" class="icon-play">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10,8 16,12 10,16" fill="currentColor"></polygon>
                        </svg>
                    </div>

                    <!-- 结束录音图标 -->
                    <div v-if="voiceStatus === 4" class="icon-end">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8,12 L11,15 L16,9" stroke="currentColor" stroke-width="2" fill="none"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="content">
                <!-- 初始提示文本 -->
                <div class="tip" :class="{ disabled: voiceStatus === 1 }" v-if="voiceStatus === 1">
                    {{ initialTip }}
                </div>

                <!-- 声波动画 -->
                <div class="voice-wave" v-show="voiceStatus !== 1">
                    <div class="wave-container" :class="{ active: isRecording || isPlaying }">
                        <div
                            v-for="i in 5"
                            :key="i"
                            class="wave-bar"
                            :style="{ 'animation-delay': `${(i - 1) * 0.2}s` }"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- 时间显示 -->
            <div class="timeline" :class="{ disabled: voiceStatus === 1 }">
                <span>{{ showRecordTime ? formatTime(playStamp) : formatTime(voiceTimer) }}</span>
                &nbsp;/&nbsp;
                {{ showRecordTime ? formatTime(voiceTimer) : formatTime(maxDuration) }}
            </div>
        </div>

        <!-- 完成提示 -->
        <div v-if="showRedo && (voiceStatus === 3 || voiceStatus === 4)" class="complete-voice">
            {{ completeText }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import Recorder from "js-audio-recorder";

// 定义组件属性
const props = defineProps({
    // 录音组件标题
    title: {
        type: String,
        default: "语音留言"
    },
    // 提示文本
    tips: {
        type: String,
        default: "点击录制语音，支持最长3分钟"
    },
    // 初始提示
    initialTip: {
        type: String,
        default: "点击开始录音"
    },
    // 重新录制文本
    redoText: {
        type: String,
        default: "重新录制"
    },
    // 完成提示文本
    completeText: {
        type: String,
        default: "您已完成录音，点击可播放或重新录制。"
    },
    // 最长录制时间（秒）
    maxDuration: {
        type: Number,
        default: 180
    },
    // 最短有效录音时间（秒）
    minValidDuration: {
        type: Number,
        default: 4
    }
});

// 定义事件
const emit = defineEmits([
    "recording-start",
    "recording-stop",
    "recording-complete",
    "recording-too-short",
    "playback-start",
    "playback-pause",
    "playback-stop",
    "playback-end",
    "recorder-error",
    "voice-redo-request",
    "show-confirm-dialog"
]);

// 响应式状态
const voiceStatus = ref(1); // 1: 初始状态, 2: 录音中, 3: 录音完成可播放, 4: 播放中
const recorder = ref(null); // 录音实例
const isRecording = ref(false); // 是否正在录音
const isPlaying = ref(false); // 是否正在播放
const voiceTimer = ref(0); // 录音总时长
const playStamp = ref(0); // 当前播放时间
const showRecordTime = ref(false); // 是否显示录音时间
const secondsTimer = ref(null); // 计时器
const voiceUrl = ref(null); // 录音URL
const voiceBlob = ref(null); // 录音Blob数据
const showRedo = ref(false); // 是否显示重新录制按钮
const voiceAudio = ref(null); // 音频元素引用

// 在组件挂载时初始化录音器
onMounted(() => {
    initRecorder();
});

// 在组件卸载前清理资源
onBeforeUnmount(() => {
    destroyRecorder();
    if (secondsTimer.value) {
        clearInterval(secondsTimer.value);
    }

    // 释放音频URL
    if (voiceUrl.value) {
        URL.revokeObjectURL(voiceUrl.value);
    }
});

// 初始化录音器
const initRecorder = () => {
    try {
        recorder.value = new Recorder({
            sampleBits: 16, // 采样位数
            sampleRate: 48000, // 采样率
            numChannels: 1, // 声道数
            compiling: true // 是否边录边转换
        });
    } catch (error) {
        console.error("初始化录音器失败:", error);
        emit("recorder-error", { type: "init", error });
    }
};

// 处理录音步骤
const handleVoiceStep = () => {
    switch (voiceStatus.value) {
        case 1: // 初始状态 -> 开始录音
            startRecorder();
            break;
        case 2: // 录音中 -> 停止录音
            pauseRecordVoice();
            break;
        case 3: // 录音完成 -> 播放录音
            playRecordVoice();
            break;
        case 4: // 播放中 -> 停止播放
            stopPlayback();
            break;
    }
};

// 开始录音
const startRecorder = async () => {
    if (isRecording.value) return;

    try {
        await Recorder.getPermission();

        if (!recorder.value) {
            initRecorder();
        }

        await recorder.value.start();

        voiceStatus.value = 2;
        isRecording.value = true;
        showRedo.value = false;

        // 设置录音进度回调
        recorder.value.onprogress = (params) => {
            if (params.duration) {
                voiceTimer.value = params.duration;
            }

            // 达到最大录音时间时自动停止
            if (params.duration >= props.maxDuration - 0.5) {
                stopRecorder("timeLimitReached");
            }
        };

        // 设置播放相关回调
        setupPlaybackCallbacks();

        // 通知父组件录音开始
        emit("recording-start");
    } catch (error) {
        console.error("开始录音失败:", error);
        emit("recorder-error", { type: error.name === "NotAllowedError" ? "permission" : "start", error });
    }
};

// 设置播放相关回调
const setupPlaybackCallbacks = () => {
    if (!recorder.value) return;

    recorder.value.onplay = () => {
        isPlaying.value = true;
        emit("playback-start");
    };

    recorder.value.onpauseplay = () => {
        isPlaying.value = false;
        clearInterval(secondsTimer.value);
        emit("playback-pause");
    };

    recorder.value.onstopplay = () => {
        isPlaying.value = false;
        playStamp.value = 0;
        clearInterval(secondsTimer.value);
        emit("playback-stop");
    };

    recorder.value.onplayend = () => {
        isPlaying.value = false;
        recorder.value.stopPlay();
        playStamp.value = 0;
        voiceStatus.value = 3;
        clearInterval(secondsTimer.value);
        emit("playback-end");
    };
};

// 暂停录音
const pauseRecordVoice = () => {
    if (!recorder.value) return;

    stopRecorder();

    // 检查录音时长是否达到最小有效时长
    if (voiceTimer.value >= props.minValidDuration) {
        voiceStatus.value = 3;
        showRecordTime.value = true;
        showRedo.value = true;

        // 获取录音数据
        voiceBlob.value = recorder.value.getWAVBlob();
        voiceUrl.value = URL.createObjectURL(voiceBlob.value);

        // 通知父组件录音完成
        emit("recording-complete", {
            duration: voiceTimer.value,
            blob: voiceBlob.value,
            url: voiceUrl.value
        });
    } else {
        // 录音时间太短
        voiceStatus.value = 1;
        voiceTimer.value = 0;
        playStamp.value = 0;
        showRecordTime.value = false;
        showRedo.value = false;

        // 通知父组件录音时间太短
        emit("recording-too-short", { duration: voiceTimer.value });
    }
};

// 停止录音
const stopRecorder = (reason = "manual") => {
    if (!recorder.value) return;

    try {
        recorder.value.stop();
        isRecording.value = false;
        clearInterval(secondsTimer.value);

        // 通知父组件录音停止
        emit("recording-stop", { reason, duration: voiceTimer.value });
    } catch (error) {
        console.error("停止录音失败:", error);
        emit("recorder-error", { type: "stop", error });
    }
};

// 播放录音
const playRecordVoice = () => {
    if (!recorder.value || !voiceUrl.value) return;

    try {
        if (playStamp.value > 0) {
            // 继续播放
            recorder.value.resumePlay();
        } else {
            // 从头开始播放
            recorder.value.play();
        }

        isPlaying.value = true;
        voiceStatus.value = 4;
        showRecordTime.value = true;

        // 开始计时
        startPlaybackTimer();

        // 通知父组件开始播放
        emit("playback-start");
    } catch (error) {
        console.error("播放录音失败:", error);
        emit("recorder-error", { type: "play", error });
    }
};

// 停止播放
const stopPlayback = () => {
    if (!recorder.value) return;

    try {
        recorder.value.pausePlay();
        isPlaying.value = false;
        voiceStatus.value = 3;
        clearInterval(secondsTimer.value);

        // 通知父组件停止播放
        emit("playback-stop");
    } catch (error) {
        console.error("停止播放失败:", error);
        emit("recorder-error", { type: "stopPlay", error });
    }
};

// 开始播放计时器
const startPlaybackTimer = () => {
    secondsTimer.value = setInterval(() => {
        if (recorder.value) {
            playStamp.value = recorder.value.getPlayTime();
            if (playStamp.value >= voiceTimer.value) {
                playStamp.value = voiceTimer.value;
            }
        }
    }, 100);
};

// 更新当前播放时间
const updateCurrentTime = (event) => {
    if (event && event.target) {
        playStamp.value = event.target.currentTime;
    }
};

// 重新录制
const handleVoiceRedo = () => {
    emit("voice-redo-request");

    // 显示确认对话框
    emit("show-confirm-dialog", {
        message: "确定要重新录制吗？当前录音将被删除。",
        onConfirm: () => redoRecording(),
        onCancel: () => {}
    });
};

// 执行重新录制
const redoRecording = () => {
    // 停止当前播放
    if (isPlaying.value) {
        stopPlayback();
    }

    // 释放之前的录音资源
    if (voiceUrl.value) {
        URL.revokeObjectURL(voiceUrl.value);
        voiceUrl.value = null;
    }

    // 重置状态
    voiceStatus.value = 1;
    voiceTimer.value = 0;
    playStamp.value = 0;
    showRecordTime.value = false;
    showRedo.value = false;
    voiceBlob.value = null;

    // 重新初始化录音器
    destroyRecorder();
    initRecorder();
};

// 销毁录音器
const destroyRecorder = () => {
    if (recorder.value) {
        try {
            recorder.value
                .destroy()
                .then(() => {
                    recorder.value = null;
                })
                .catch((error) => {
                    console.error("销毁录音器失败:", error);
                });
        } catch (error) {
            console.error("销毁录音器失败:", error);
            recorder.value = null;
        }
    }
};

// 格式化时间
const formatTime = (time) => {
    if (!time && time !== 0) return "00:00";

    time = Math.ceil(time);
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
};

// 获取录音数据 (供外部调用)
const getRecordingData = () => {
    if (!voiceBlob.value) return null;

    return {
        blob: voiceBlob.value,
        url: voiceUrl.value,
        duration: voiceTimer.value,
        fileName: `voice_recording_${new Date().getTime()}.wav`
    };
};

// 将录音转换为文件对象
const getRecordingFile = () => {
    if (!voiceBlob.value) return null;

    return new File([voiceBlob.value], `voice_recording_${new Date().getTime()}.wav`, {
        type: "audio/x-wav"
    });
};

// 导出组件方法供父组件使用
defineExpose({
    getRecordingData,
    getRecordingFile,
    startRecorder,
    stopRecorder,
    playRecordVoice,
    stopPlayback,
    redoRecording,
    voiceStatus,
    voiceTimer,
    isRecording,
    isPlaying
});
</script>

<style scoped>
.voice-recorder-container {
    width: 100%;
    margin-bottom: 20px;
}

.voice-control-header {
    margin-bottom: 10px;
}

.voice-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.voice-title h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
}

.redo-btn {
    font-size: 14px;
    color: #333;
    cursor: pointer;
    text-decoration: underline;
    margin: 0;
}

.voice-tips {
    font-size: 14px;
    color: #666;
    display: block;
    margin-bottom: 8px;
}

.record-content {
    display: flex;
    align-items: center;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
}

.record-btn {
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.record-btn.disabled {
    opacity: 0.6;
}

.start-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.start-btn svg {
    width: 32px;
    height: 32px;
}

.icon-start {
    color: #f56c6c;
}

.icon-stop {
    color: #f56c6c;
}

.icon-play {
    color: #409eff;
}

.icon-end {
    color: #67c23a;
}

.content {
    flex: 1;
    margin: 0 15px;
}

.tip {
    color: #333;
    font-size: 14px;
}

.tip.disabled {
    color: #999;
}

.voice-wave {
    height: 30px;
    display: flex;
    align-items: center;
}

.wave-container {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 4px;
}

.wave-bar {
    width: 3px;
    height: 15px;
    background-color: #ddd;
    border-radius: 1px;
}

.wave-container.active .wave-bar {
    background-color: #f56c6c;
    animation: sound-wave 1s infinite ease-in-out;
}

@keyframes sound-wave {
    0% {
        height: 5px;
    }
    50% {
        height: 25px;
    }
    100% {
        height: 5px;
    }
}

.timeline {
    width: 90px;
    text-align: right;
    font-size: 14px;
    color: #333;
}

.timeline.disabled {
    color: #999;
}

.complete-voice {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
}

/* 移动端适配 */
@media (max-width: 768px) {
    .record-content {
        flex-wrap: wrap;
    }

    .timeline {
        width: 100%;
        text-align: left;
        margin-top: 10px;
        padding-left: 55px;
    }
}
</style>
