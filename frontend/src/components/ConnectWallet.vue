<template>
    <div class="flex justify-center">
        <div class="w-[300px] pl-[5px] pr-[5px]">
            <div @click="connectMetamask()" v-if='!loading && !login'
                class="custom-button">
                Connect MetaMask
            </div>
            <div v-if='loading'
                class="custom-button cursor-progress">
                <div v-if='loading' class="flex"><img src="../assets/Icons/loading.png" alt=""
                        class="motion-reduce:hidden animate-spin dark:invert">&nbsp;&nbsp;Loading...</div>
            </div>

            <div v-if="login && !loading" class="custom-button cursor-not-allowed bg-[#bea006]">
                {{ shortWallet }}
            </div>

            <!-- Custom Wallet, at later stages to be removed -->
            <!-- <div 
                class="custom-button cursor-not-allowed bg-[#bea006]">
                0x2DE328...0A3733{{ shortWallet }}</div>
            </div> -->
        </div>
    </div>
</template>

<script>

import { defineComponent, defineModel } from 'vue';

import {
    mapActions,
    mapState
} from 'pinia'

import {
    useUser
} from '../stores/user'

export default defineComponent({
    name: 'ConnectWallet',
    beforeMount() {
        this.environmentsetup()
    },
    computed: {
        ...mapState(useUser, ['shortWallet', 'loading', 'login']),
    },
    methods: {
        ...mapActions(useUser, ['connectMetamask', 'environmentsetup'])
    }
})
</script>

<style>
/* Combined CSS class */
.custom-button {
  margin-top: 10px;
  margin-bottom: 10px;
  height: 75px;
  /* background-color: #FFD400; */
  border-radius: 17px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 1.5rem; /* Adjust as per your design */
  letter-spacing: 1.5px;
}

.custom-button:hover {
  background-color: #bea006;
}

</style>