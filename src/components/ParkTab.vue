<template>
    <mu-flexbox orient="vertical" align="stretch" class="park-tab">

        <mu-refresh-control :refreshing="refreshing" :trigger="trigger" @refresh="refresh"/>
        <div class="canvas-box">
        </div>

        <div>
            <mu-menu-item title="停车位数量">
                <mu-badge content="120" color="green" slot="after"/>
            </mu-menu-item>
            <mu-menu-item title="剩余停车位">
                <mu-badge content="12" color="green" slot="after"/>
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

    export default {
        name: '',
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
                parkInfo:{},
                parkList:[]
            }
        },
        created() {
            this.parkInfo = JSON.parse(Vue.localStorage.get('parkInfo', '{status:true}'))
            this.parkList = JSON.parse(Vue.localStorage.get('parkList', '[]'))
        },
        mounted: function () {
            this.cameraInput = document.getElementById('car')
            this.trigger = this.$el
        },
        computed: {
            parkCost() {
                return Math.ceil((this.parkInfo.endTime - this.parkInfo.startTime) / 1000 / 3600)*5
            },
        },
        methods: {
            save() {
                Vue.localStorage.set('parkInfo', JSON.stringify(this.parkInfo))
            },
            park(pos) {
                this.showToast('停车成功')
                this.closeParkSheet()
                this.parkInfo.startTime = Date.now()
                this.parkInfo.status = true
                this.save()
            },
            pay() {
                this.parkInfo.cost=this.parkCost
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
                            this.parkInfo.pos = t
                            console.log(t)
                            this.openParkSheet()
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
                        this.showToast('标识出了您当前位置')
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
                    const list = []
                    for (let i = this.num; i < this.num + 10; i++) {
                        list.push('item' + (i + 1))
                    }
                    this.list = list
                    this.num += 10
                    this.refreshing = false
                }, 2000)
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
        background-color: seagreen;
    }

    .button-box {
        margin: 5px 0;
    }

    .amap {
        display: flex;

    }
</style>
