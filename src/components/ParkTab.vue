<template>
    <mu-flexbox orient="vertical" align="stretch" class="park-tab">

        <mu-refresh-control :refreshing="refreshing" :trigger="trigger" @refresh="refresh"/>
        <div class="canvas-box" id="canvas-box">
            <canvas id="canvas"></canvas>
        </div>

        <div>
            <mu-menu-item title="停车位数量">
                <mu-badge :content="allParkNum" color="green" slot="after"/>
            </mu-menu-item>
            <mu-menu-item title="剩余停车位">
                <mu-badge :content="nowParkNum" color="green" slot="after"/>
            </mu-menu-item>
            <mu-menu-item v-if="parkInfo.status" title="您的车停在">
                <mu-badge :content="parkInfo.pos" color="blue" slot="after"/>
            </mu-menu-item>
            <div v-if="!parkInfo.status">
                <mu-raised-button class="button-box" label="扫码停车哦" @click="tryPark" fullWidth primary/>
            </div>
            <div v-else>
                <mu-raised-button class="button-box" label="扫码定位当前位置" @click="scanToLocation" fullWidth primary/>
                <mu-raised-button class="button-box" label="结账开走" @click="openPaySheet" fullWidth primary/>
            </div>
            <input id="car" type="file" @change="scanFile" value="扫描二维码" capture="camera" v-show="false">
        </div>

        <img v-for="item,index in pics" :src="item" :id="'img-'+index" v-show="false">
        <mu-bottom-sheet :open="parkSheet" @close="closeParkSheet">
            <mu-sub-header>
                确认您的停车信息
            </mu-sub-header>

            <mu-list-item title="停车号">
                <mu-badge :content="parkInfo.pos" slot="after"/>
            </mu-list-item>
            <mu-list-item title="其他信息">
            </mu-list-item>
            <mu-flat-button label="确定停车" @click="park(parkInfo.pos)" style="width: 100%" primary/>
        </mu-bottom-sheet>
        <mu-bottom-sheet :open="paySheet" @close="closePaySheet">
            <mu-sub-header>
                确认您的停车信息
            </mu-sub-header>

            <mu-list-item title="停车号">
                <mu-badge color="green" :content="parkInfo.pos" slot="after"/>
            </mu-list-item>
            <mu-list-item title="停车时间">
                <mu-badge color="green" :content="new Date(parkInfo.startTime).toLocaleTimeString()" slot="after"/>
            </mu-list-item>
            <mu-list-item title="开走时间">
                <mu-badge color="green" :content="new Date(parkInfo.endTime).toLocaleTimeString()" slot="after"/>
            </mu-list-item>
            <mu-list-item title="支付金额">
                <mu-badge color="green" :content="parkCost.toString()+'元'" slot="after"/>
            </mu-list-item>
            <mu-flat-button label="支付宝支付" @click="pay" style="width: 100%" primary/>
        </mu-bottom-sheet>
        <mu-toast v-if="toast" :message="message" @close="hideToast"/>

    </mu-flexbox>
</template>

<script>
    import {qrcode} from './../assets/js/qrcode.js'
    import Vue from 'vue'
    import ParkTabCanvas from '@/components/ParkTabCanvas'
    import EasyStar from 'easystarjs'

    export default {
        name: '',
        components: {
            ParkTabCanvas: ParkTabCanvas
        },
        data() {
            return {
                parkSheet: false,
                paySheet: false,
                pos: 12,
                toast: false,
                cameraInput: null,
                cb: (t, ok) => {
                    if (ok) {
                        this.pos = t
                        console.log(t)
                        this.openParkSheet()
                    }
                },
                message: '',
                refreshing: false,
                trigger: null,
                parkInfo: {},
                parkList: [],
                canvas: null,
                windowWidth: document.body.clientWidth,
                canvasBox: null,
                context: null,
                w: 0,
                h: 0,
                // map 表示当前停车场地图
                // 0 表示 路
                // 1 表示 未被停车车位
                // 2 表示 被停车车位
                // 3 表示 墙哦
                // 4 表示 出口哦
                // 5 表示 电梯哦
                map: [
                    [3, 0, 1, 1, 2, 1, 1, 2, 2, 2, 0, 3],
                    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [1, 0, 2, 3, 1, 0, 1, 3, 0, 2, 2, 2],
                    [1, 0, 2, 3, 2, 0, 1, 3, 0, 0, 0, 0],
                    [1, 0, 2, 3, 1, 0, 2, 3, 0, 0, 0, 4],
                    [2, 0, 2, 3, 2, 0, 1, 3, 0, 0, 0, 4],
                    [2, 0, 1, 3, 1, 0, 1, 3, 0, 0, 0, 0],
                    [1, 0, 2, 3, 2, 0, 2, 3, 0, 2, 2, 2],
                    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [3, 0, 0, 0, 4, 4, 4, 0, 0, 0, 5, 5],
                ],
                pics: [
                    0,
                    require('./../assets/greencar.png'),
                    require('./../assets/redcar.png'),
                    require('./../assets/墙.png'),
                    require('./../assets/exit.png'),
                    require('./../assets/电梯.png'),
                    require('./../assets/车辆.png'),
                    require('./../assets/我.png')
                ],
                me: -1
            }
        },
        created() {
            this.parkInfo = JSON.parse(Vue.localStorage.get('parkInfo', '{status:true}'))
            this.parkList = JSON.parse(Vue.localStorage.get('parkList', '[]'))
        },
        mounted: function () {
            this.$nextTick(() => {

                this.cameraInput = document.getElementById('car')
                this.trigger = this.$el
                this.canvas = document.getElementById('canvas')
                this.context = this.canvas.getContext('2d')
                this.canvasBox = document.getElementById('canvas-box')
                this.resize()
                document.body.onresize = this.resize
            })
        },
        computed: {
            parkCost() {
                return Math.ceil((this.parkInfo.endTime - this.parkInfo.startTime) / 1000 / 3600) * 5
            },
            allParkNum() {
                let t = 0;

                for (let i = 0; i < this.map.length; i++) {
                    for (let j = 0; j < this.map[i].length; j++) {
                        if(this.map[i][j]===1||this.map[i][j]===2){
                            t+=1;
                        }
                    }
                }
                return t;
            },
            nowParkNum(){

                let t = 0;

                for (let i = 0; i < this.map.length; i++) {
                    for (let j = 0; j < this.map[i].length; j++) {
                        if(this.map[i][j]===1){
                            t+=1;
                        }
                    }
                }
                return t;
            }
        },
        methods: {
            save() {
                Vue.localStorage.set('parkInfo', JSON.stringify(this.parkInfo))
                this.draw()
            },
            park(pos) {
                this.showToast('停车成功')
                this.closeParkSheet()
                this.parkInfo.startTime = Date.now()
                this.parkInfo.status = true
                this.save()
            },
            pay() {
                this.parkInfo.cost = this.parkCost
                this.parkList.push(this.parkInfo)
                Vue.localStorage.set('parkList', JSON.stringify(this.parkList))
                this.parkInfo.status = false
                this.save()
                this.closePaySheet()
                this.showToast('取车成功')
            },
            tryPark() {
                this.cb = (t, ok) => {
                    if (ok) {
                        t = Number.parseInt(t)
                        if (isNaN(t)) {
                            this.showToast('二维码内容错误')
                        } else {
                            if (this.map[Math.floor(t / this.map[0].length)][t % this.map[0].length] === 1) {
                                this.parkInfo.pos = t
                                console.log(t)
                                this.openParkSheet()
                            } else if (this.map[Math.floor(t / this.map[0].length)][t % this.map[0].length] === 2) {
                                this.showToast('车位有人啦')
                            } else {
                                this.showToast('二维码内容错误')
                            }
                        }
                    }
                }
                this.openCamera()
            },
            openCamera() {
                this.cameraInput.value = ''
                this.cameraInput.click()
            },
            scanToLocation() {
                this.cb = (t, ok) => {
                    console.log(t)
                    if (ok) {
                        t = Number.parseInt(t)
                        if (isNaN(t)) {
                            this.showToast('二维码内容错误')
                        } else {
                            this.me = t
                            this.showToast('标识出了您当前位置')
                            let m = new EasyStar.js();
                            m.setGrid(this.map);
                            m.setAcceptableTiles([0, 1, 2, 4, 5]);
                            m.findPath(
                                Math.floor(this.me / this.map[0].length),
                                Math.floor(this.me % this.map[0].length),
                                Math.floor(this.parkInfo.pos / this.map[0].length),
                                Math.floor(this.parkInfo.pos % this.map[0].length),
                                function (path) {
                                    console.log(path)
                                });
                            this.draw()
                        }
                    }
                }
                this.openCamera()
            },
            scanFile() {
                if (this.cameraInput.files.length === 1) {
                    qrcode.callback = this.cb
                    this.handleFiles(this.cameraInput.files)
                }
            },
            closeParkSheet() {
                this.parkSheet = false
            },
            openParkSheet() {
                if (this.cameraInput.files.length === 1) {
                    this.parkSheet = true
                }
            },
            handleFiles(f) {
                var o = [];
                const that = this
                for (var i = 0; i < f.length; i++) {
                    var reader = new FileReader();
                    reader.onload = function () {
                        console.log(reader.result);
                        qrcode.decode(reader.result);
                    }
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(f[i]);
                }
            },
            showToast(text) {
                this.toast = true
                this.message = text
                if (this.toastTimer) clearTimeout(this.toastTimer)
                this.toastTimer = setTimeout(() => {
                    this.toast = false
                }, 2000)
            }, hideToast() {
                this.toast = false
            },
            openPaySheet() {
                this.parkInfo.endTime = Date.now()
                this.paySheet = true
                this.save()

            },
            closePaySheet() {
                this.paySheet = false
            }, refresh() {
                this.refreshing = true
                setTimeout(() => {
                    this.me = -1;
                    this.draw();
                    this.refreshing = false
                }, 1000)
            },
            draw() {
                this.context.clearRect(0, 0, canvas.width, canvas.height);
                let cellWidth = this.w / (this.map[0].length + 1);
                let cellHeight = this.w / (this.map.length + 1);
                for (let i = 0; i < this.map.length; i++) {
                    for (let j = 0; j < this.map[i].length; j++) {
                        let t = this.map[i][j]
                        if (this.parkInfo.status && i * this.map[0].length + j === this.parkInfo.pos) {
                            t = 6
                        }
                        if (i * this.map[0].length + j === this.me) {
                            t = 7
                        }
                        if (t == 0) continue;
                        let img = document.getElementById('img-' + t)
                        ///console.log(img)
                        this.context.drawImage(img, j * cellWidth, i * cellHeight, cellWidth, cellHeight);

                    }
                }
            },
            resize() {
                console.log(this.canvasBox.clientWidth)
                console.log(this.canvasBox.clientHeight)
                this.h = this.canvas.height = this.canvasBox.clientHeight - 5
                this.w = this.canvas.width = this.canvasBox.clientWidth
                this.draw()
            }
        }
    }
</script>

<style scope>
    .park-tab {
        position: relative;
        height: 100%;
    }

    .canvas-box {
        flex-grow: 2;
    }

    .button-box {
        flex-grow: 1;
        margin: 5px 0;
    }

    .amap {
        display: flex;

    }
</style>
