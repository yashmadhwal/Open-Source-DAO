<template>
  <NavHeader />
  <!-- Notification -->
  <transition name="fade">
    <div v-if="showNotification" class="notification flex justify-between">
      <div> Hash copied to clipboard!</div>
      <div @click="showNotification = false" class="text-white cursor-pointer pl-2">&times;</div>
    </div>
  </transition>



  <div class="flex-grow flex-col flex justify-center justify-center items-center space-y-4">
    <div v-if="!address" class="p-4 rounded rounded-[20px] w-[600px] mx-auto bg-[#541388] tracking-[2px] shadow-2xl space-y-4">
      <h2 class="text-lg font-bold text-center text-[#F1E9DA]">Link project</h2>

      <input type="text" v-model="addressInput" id="projectContractAddrInput" name="projectContractAddrInput" placeholder="Project address"
          class="form-input block w-full" required>
      <div @click="linkContract()" class="custom-button-fund">Go</div>
    </div>

    <div v-if="address" class="p-4 rounded rounded-[20px] w-[600px] mx-auto bg-[#541388] tracking-[2px] shadow-2xl text-[#F1E9DA]">
      <h2 class="text-lg font-bold text-center">Fund Collection Progress <span v-if="icoOver && icoSuccess">(SUCCESS)</span></h2>

      <!-- Project Information -->
      <div class="flex justify-between information-block">
        Project HASH:
        <div class="flex">{{ minHash }} &nbsp<img @click="copyToClipboard()" src="../assets/Icons/copy.png" alt=""
            class="h-[20px] cursor-pointer btn-copy invert"></div>
      </div>

      <!-- Time -->
      <div class="flex justify-between information-block">
        Time Left:
        <div v-if="timeLeft > 0">
          {{ timeLeftToFinish.days }} days {{ timeLeftToFinish.hours }}:{{ timeLeftToFinish.minutes }}:{{
            timeLeftToFinish.seconds }}
        </div>
        <div v-else>
          The countdown has ended.
        </div>
      </div>


      <!-- Progress bar -->
      <div class="w-full bg-[#F1E9DA] rounded-lg overflow-hidden">
        <div class="text-black bg-gradient-to-r to-cyan-500 from-[#FFD400] information-block py-1"
          :style="{ width: progress + '%' }">
          <span class="text-sm font-semibold">{{ progress }}%</span>
        </div>
      </div>

      <!-- Amount collected -->
      <div class="information-block flex justify-between">
        <div>
          Collected:
        </div>
        <div>
          {{ amountCollected / 1e18 }} / {{ totalAmount / 1e18 }} ETH
        </div>
      </div>

      <!-- Fund Now -->
      <!-- Check that campaining still going of -->

      <div>
        <div v-if="timeLeft > 0" @click="fund()" class="custom-button-fund">
          Fund Now!
        </div>
        <div v-else>
          <div @click="finishFunding()" class="custom-button-fund">
            Funding over
          </div>
        </div>
      </div>
      




    </div>

    <!-- <div class="p-[10px]">
      <button @click="increaseFund()" class='text-black bg-green-200 m-2'>Increase</button><br>
      <button @click="decreseFund()" class='text-black bg-red-200 m-2'>Decrease</button>
    </div> -->

  </div>

  <Footer></Footer>
</template>
  
<script>
import Clipboard from 'clipboard';

import {
    mapActions,
    mapState
} from 'pinia'

import { useContract } from '../stores/contract/contract';

import NavHeader from '../components/NavHeader.vue';
import Footer from '../components/Footer.vue';

export default {
  components: {
    NavHeader,
    Footer,
  },
  data() {
    return {
      progress: 0, // Initial progress percentage
      timeLeft: 0,
      timeLeftToFinish: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      showNotification: false,
      addressInput: "",
    };
  },
  computed: {
    ...mapState(useContract, ['address', 'hash', 'minHash', 'totalAmount', 'amountCollected', 'icoEndtime', 'name', 'icoSuccess', 'icoOver'])
  },
  mounted() {
    this.refresh()
  },
  beforeDestroy() {
    // Clear the interval when the component is destroyed
    clearInterval(this.intervalId);
  },
  methods: {
    async finishFunding() {
      try {
        const contract = useContract()
        if (contract.icoOver) {
          throw new Error("ICO ended")
        }

        await contract.finishIco()
      } catch (e) {
        alert(e)
      }
    },

    async refresh() {
      this.updateTimeLeft();
      // Update time left every second
      this.intervalId = setInterval(this.updateTimeLeft, 1000);
      // Checking the progress
      this.calculateProgress();
    },

    async linkContract() {
      try {
        const address = this.addressInput
        console.log("linking contract " + address)

        const contract = useContract()
        await contract.load(address)
        await contract.persistAddress(address)

        this.refresh()

        console.log(contract.$state)
      } catch (e) {
        alert(e)
      }
    },

    async fund() {
      const contract = useContract()
      const ether = prompt("How much you'd like to donate? (Wei)", "0")

      await contract.fund(ether)
      this.calculateProgress()
    },

    copyToClipboard() {
      const contract = useContract()

      const text = contract.hash
      console.log(text)
      const clipboard = new Clipboard('.btn-copy', {
        text: () => text
      })
      this.showCopiedNotification()

    },
    increaseFund() {
      const contract = useContract()

      if (contract.amountCollected < contract.totalAmount && contract.amountCollected >= 0) {
        contract.amountCollected = contract.amountCollected + 10;
        this.calculateProgress()
      } else {
        alert('max Reached')
      }
    },
    decreseFund() {
      const contract = useContract()

      if (contract.amountCollected > 0) {
        contract.amountCollected = contract.amountCollected - 10;
        contract.calculateProgress()
      } else {
        alert('min')
      }
    },
    calculateProgress() {
      const contract = useContract()

      this.progress = Number(contract.amountCollected / contract.totalAmount) * 100;
    },
    showCopiedNotification() {
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 2000); // Adjust the duration as needed (in milliseconds)
    },
    updateTimeLeft() {
      const contract = useContract()

      const currentTime = Math.floor(Date.now() / 1000); // Current UNIX time in seconds
      console.log(currentTime)
      this.timeLeft = contract.icoEndtime - currentTime;
      console.log(this.timeLeft)
      if (this.timeLeft > 0) {
        this.timeLeftToFinish.days = Math.floor(this.timeLeft / (60 * 60 * 24));
        this.timeLeftToFinish.hours = Math.floor((this.timeLeft % (60 * 60 * 24)) / (60 * 60));
        this.timeLeftToFinish.minutes = Math.floor((this.timeLeft % (60 * 60)) / 60);
        this.timeLeftToFinish.seconds = this.timeLeft % 60;
      } else {
        // Stop the countdown if the target time has passed
        clearInterval(this.intervalId);
      }
    }
  },
};
</script>
  
<style scoped>
/* Add scoped styles if needed */
* {
  /* border: 1px solid; */
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #541388;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */
  {
  opacity: 0;
}

.information-block {
  padding: 5px 10px 5px 10px;
}

.custom-button-fund {
  color: black;
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
  height: 40px;
  width: 200px;
  background-color: #FFD400;
  border-radius: 17px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  /* Adjust as per your design */
  letter-spacing: 1.5px;

}

.custom-button-fund:hover {
  background-color: #bea006;
}
</style>
  