<template>
    <canvas id="canvas">

    </canvas>
</template>

<script>
    export default {
        name: '',
        data() {
            return {
                canvas: null,
                windowWidth: document.body.clientWidth,
                canvasBox: null,
                context:null,
                w:0,
                h:0,
                // map 表示当前停车场地图
                // 0 表示 路
                // 1 表示 未被停车车位
                // 2 表示 被停车车位
                // 3 表示 墙哦
                // 4 表示 出口哦
                // 5 表示 电梯哦
                map:[
                    [3,0,2,1,2,1,1,2,2,2,0,3],
                    [2,0,0,0,0,0,0,0,0,0,0,0],
                    [1,0,2,3,1,0,1,3,0,2,2,2],
                    [1,0,2,3,2,0,1,3,0,0,0,0],
                    [1,0,2,3,1,0,2,3,0,0,0,4],
                    [2,0,2,3,2,0,1,3,0,0,0,4],
                    [2,0,6,3,1,0,1,3,0,0,0,0],
                    [1,0,2,3,2,0,2,3,0,2,2,2],
                    [1,0,0,0,0,0,0,0,0,0,0,0],
                    [3,0,0,0,4,4,4,0,0,0,5,5],
                ],
                pics:[
                    0,
                    require('./../assets/redcar.png'),
                    require('./../assets/greencar.png'),
                    require('./../assets/墙.png'),
                    require('./../assets/exit.png'),
                    require('./../assets/电梯.png'),
                    require('./../assets/车辆.png')
                ]
            }
        },
        mounted() {
            let that = this
            this.$nextTick(() => {
                this.canvas = document.getElementById('canvas')
                this.context = this.canvas.getContext('2d')
                this.canvasBox = document.getElementById('canvas-box')
                this.resize()
                document.body.onresize = this.resize
            })
        },
        watch: {
        },
        methods:{

        }
    }
</script>

<style>
    .canvas {

    }
</style>
