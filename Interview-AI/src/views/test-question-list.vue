<template>
    <div class="test-container">
        <h1>问题列表测试页面</h1>
        <QuestionList />
    </div>
</template>

<script setup>
import QuestionList from '@/views/interview/execution/components/QuestionList.vue'
</script>

<style scoped>
.test-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

h1 {
    margin-bottom: 20px;
    color: #333;
}
</style>