// 这里写通用的请求，如果项目太复杂建议分片建立文件
import { get, post, put, Delete } from "./index"

// eg：
//
export function ResumeAnalysisAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/ResumeAnalysis"
    return post(url, data)
}
export function questionBankExtractionAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/questionBankExtraction"
    return post(url, data)
}
export function singleAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/v1/files/single"
    return post(url, data)
}
export function getaAudioAnalysisResAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/getaAudioAnalysisRes"
    return post(url, data)
}
export function interviewInitAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/interviewInit"
    return post(url, data)
}
export function audioAnalysisAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/audioAnalysis"
    return post(url, data)
}
export function getAiEvaluationAPI(data) {
    // const url = "http://172.16.1.39:8850/article/fileProcessor";
    const url = "/ai/getAiEvaluation"
    return post(url, data)
}

//获取当月考勤整体数据

