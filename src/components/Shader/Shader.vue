<template>
  <canvas ref="refCanvas" />
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  shader: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'light' // или любое другое значение по умолчанию
  }
})

const refCanvas = ref(null)
let gl = null
let shaderProgram = null
let themeUniformLocation = null

// Функция для обновления uniform-переменных в шейдере
const updateUniforms = () => {
  if (!gl || !shaderProgram) return
  
  // Получаем location для переменной iTheme
  if (!themeUniformLocation) {
    themeUniformLocation = gl.getUniformLocation(shaderProgram, 'iTheme')
  }
  
  // Устанавливаем значение: 0.0 для темной темы, 1.0 для светлой
  const themeValue = props.theme === 'light' ? 1.0 : 0.0
  gl.uniform1f(themeUniformLocation, themeValue)
}

// Следим за изменениями темы
watch(() => props.theme, () => {
  updateUniforms()
}, { immediate: true })

onMounted(() => {
  const canvas = refCanvas.value
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `
  const fsSource = props.shader
  
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }
  
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
  }
  
  function resizeCanvasToDisplaySize(canvas) {
    const width = canvas.clientWidth * window.devicePixelRatio
    const height = canvas.clientHeight * window.devicePixelRatio
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      return true
    }
    return false
  }
  
  function render() {
    if (resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    }
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(shaderProgram)
    
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vertexPosition)
    
    const timeUniformLocation = gl.getUniformLocation(shaderProgram, 'iTime')
    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'iResolution')

    gl.uniform1f(timeUniformLocation, performance.now() / 3000.0)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)
    
    // Обновляем uniform для темы
    updateUniforms()
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(render)
  }
  
  requestAnimationFrame(render)
})
</script>
<style scoped>
  canvas {
    width: 100%;
    height: 100%;
  }
</style>