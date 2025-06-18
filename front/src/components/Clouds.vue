<template>
    <div id="background-wrap">
        <div class="cloud x1" ref="cloud1"></div>
        <div class="cloud x2" ref="cloud2"></div>
        <div class="cloud x3" ref="cloud3"></div>
        <div class="cloud x4" ref="cloud4"></div>
        <div class="cloud x5" ref="cloud5"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const cloud1 = ref(null)
const cloud2 = ref(null)
const cloud3 = ref(null)
const cloud4 = ref(null)
const cloud5 = ref(null)

const clouds = [cloud1, cloud2, cloud3, cloud4, cloud5]
const factors = [0.2, -0.3, 0.15, -0.25, 0.18]

function handleScroll() {
    const scrollY = window.scrollY
    clouds.forEach((cloud, i) => {
        if (cloud.value) {
            cloud.value.style.transform =
                `translateX(${scrollY * factors[i]}px) scale(${cloud.value.dataset.scale})`;
        }
    })
}

onMounted(() => {
    const scales = [0.7, 0.5, 0.6, 0.4, 0.8]
    clouds.forEach((cloud, i) => {
        if (cloud.value) {
            cloud.value.dataset.scale = scales[i]
            cloud.value.style.transform = `scale(${scales[i]})`
        }
    })
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
#background-wrap {
    bottom: 0;
	left: 0;
	padding-top: 50px;
	position: fixed;
	right: 0;
	top: 0;
	z-index: -1;
    pointer-events: none;
}

.x1, .x2, .x3, .x4, .x5 {
  position: absolute;
}

.x1 {
  left: 7%;
  top: 12%;
}

.x2 {
  left: 75%;
  top: 22%;
}

.x3 {
  left: 18%;
  top: 60%;
}

.x4 {
  left: 65%;
  top: 70%;
}

.x5 {
  left: 40%;
  top: 80%;
}

.cloud {
	background: #fff;
	background: linear-gradient(top,  #fff 5%,#f1f1f1 100%);
	border-radius: 100px;
	box-shadow: 0 8px 5px rgba(0, 0, 0, 0.1);
	height: 120px;
	position: relative;
	width: 350px;
}

.cloud:after, .cloud:before {
    background: #fff;
	content: '';
	position: absolute;
	z-indeX: -1;
}

.cloud:after {
	border-radius: 100px;
	height: 100px;
	left: 50px;
	top: -50px;
	width: 100px;
}

.cloud:before {
	border-radius: 200px;
	width: 180px;
	height: 180px;
	right: 50px;
	top: -90px;
}
</style>