<template>
  <!-- Navigation Header -->
  <NavHeader />

  <transition name="fade">
      <div v-if="showNotification" class="notification flex justify-between">
          <div> Address copied to clipboard!</div>
          <div @click="showNotification = false" class="text-white cursor-pointer pl-2">&times;</div>
      </div>
  </transition>

  <!-- Project Proposal Form -->
  <div class="p-[10px] h-max flex-grow justify-center flex justify-center items-center ">
    <div class="border-[2px] p-3 w-[700px] bg-[#541388] rounded rounded-[20px] shadow-2xl">
      <h1 class="text-4xl font-bold mb-4 text-center text-[#F1E9DA]">Project Proposal Form</h1>

      <div v-if="!submitting && !submittedProjectContractAddress">
        <input type="text" v-model="proposalHash" id="proposalHash" name="proposalHash" placeholder="Document hash"
          class="form-input block w-full" required>

        <div class="flex">
          <input type="number" v-model="duration" id="duration" name="duration" placeholder="Duration (Months)"
            class="form-input block w-full" min="1" required>

          <input type="number" v-model="monthlyAllowance" id="monthlyAllowance" name="monthlyAllowance"
            placeholder="Team Monthly Allowance (WEI)" min="1" class="form-input block w-full" required>
        </div>

        
        <input type="text" v-model="developerAddresses" id="developerAddresses" name="developerAddresses"
          placeholder="Addresses separated by commas" class="form-input block w-full" required>
        

          <div>
        <input type="number" v-model="multisigThreshold" id="multisigThreshold" name="multisigThreshold"
          placeholder="Multisig signature threshold" min="1" class="form-input block w-full" required>
        </div>

        <input type="text" v-model="fundsCollectionDeadline" id="fundsCollectionDeadline" name="fundsCollectionDeadline"
          placeholder="ICO deadline (unix timestamp)" class="form-input block w-full" required>
        <div class="flex mx-auto">
          
          <input type="number" v-model="consensusTimeframe" id="consensusTimeframe" name="consensusTimeframe"
            placeholder="Days for monthly consensus" min="1" class="form-input block w-full" required>
          

          
          <input type="number" v-model="sponsorVoteQuorum" id="sponsorVoteQuorum" name="sponsorVoteQuorum"
            placeholder="Sponsor monthly vote quorum (%)" min="1" class="form-input block w-full" required>

        </div>

        <div class="flex">
          <input type="number" v-model="utilityTokenSupply" id="utilityTokenSupply" name="utilityTokenSupply"
            placeholder="Total utility token supply" min="1" class="form-input block w-full" required>

          <input type="number" v-model="reportThreshold" id="reportThreshold" name="reportThreshold"
            placeholder="Threshold for monthly report signatures" min="1" class="form-input block w-full" required>
        </div>
        
        <div class="mt-4 flex justify-center text-center">
          <button @click="submitLaunch()" type="submit" class="submit-button">
            Submit
          </button>
        </div>
      </div>

      <div v-if="submitting && !submittedProjectContractAddress" class="mt-4 flex justify-center text-center">
        <img src="../assets/Icons/loading.png" alt="" class="motion-reduce:hidden animate-spin dark:invert">&nbsp;&nbsp;
        <div>
          <p class="text-[#F1E9DA]">
          Submitting...
          </p>
        </div>
      </div>

      <div v-if="!submitting && submittedProjectContractAddress" class="mt-4 flex justify-center text-center text-[#F1E9DA]">
        Submitted at {{ submittedProjectContractAddress }} &nbsp
        <img @click="copyToClipboard()" src="../assets/Icons/copy.png" alt="" class="h-[20px] cursor-pointer btn-copy invert">
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>

<script>
import NavHeader from '../components/NavHeader.vue';
import Footer from '../components/Footer.vue';
import { defineComponent, defineModel } from 'vue';
import { deployProject } from '../../utils'

import ClipboardJS from 'clipboard';

import {
    mapState
} from 'pinia'

import {
    useUser
} from '../stores/user'

export default {
  name: 'LaunchProject',
  components: {
    NavHeader,
    Footer
  },
  computed: {
    ...mapState(useUser, ['signer']),
  },
  methods: {
    async submitLaunch() {
      if (!this.signer) {
        alert("Please, connect metamask wallet")
        return
      }

      this.submitting = true

      const ONE_MONTH_IN_SECS = 3600 * 24 * 30
      const nowUnixTs = Math.trunc(Date.now() / 1000)
      const durationMonths = parseInt(this.duration, 10)
      // const durationSecs = durationMonths * ONE_MONTH_IN_SECS
      const vestingStartTs = parseInt(this.fundsCollectionDeadline, 10)

      const params = {
        depositLowCap: 1n,
        votingAbortPercent: 100 - parseInt(this.sponsorVoteQuorum, 10),
        startTimestamp: nowUnixTs,
        endTimestamp: vestingStartTs,
        vestingMonthsDuration: this.duration,
        successLowerThreshold: parseInt(this.monthlyAllowance, 10) * durationMonths,
        signersThres: this.multisigThreshold,
        signers: this.developerAddresses.split(","),
        projectDocHash: this.proposalHash,
      }

      // console.log(JSON.stringify(params))

      const projectAddr = await deployProject(this.signer, params)

      this.submitting = false
      this.submittedProjectContractAddress = projectAddr
    },
    copyToClipboard() {
      const text = this.submittedProjectContractAddress
      console.log(text)
      const clipboard = new ClipboardJS('.btn-copy', {
          text: () => text
      })
      this.showCopiedNotification()
    },
    showCopiedNotification() {
      this.showNotification = true;
      setTimeout(() => {
          this.showNotification = false;
      }, 2000); // Adjust the duration as needed (in milliseconds)
    },

  },

  data() {
    return {
      submitting: false,
      proposalHash: "",
      duration: "",
      monthlyAllowance: "",
      developerAddresses: "",
      multisigThreshold: "",
      fundsCollectionDeadline: "",
      consensusTimeframe: "",
      sponsorVoteQuorum: "",
      utilityTokenSupply: "",
      reportThreshold: "",
      submittedProjectContractAddress: null,
      showNotification: false
    }
  },
  setup() {}
}
</script>

<style>
.form-input {
  border: 1.5px solid #675F3E;
  border-radius: 10px;
  height: 40px;
  text-align: center;
  margin-top: 5px;
}

.form-input:hover {
  border: 1.5px solid #FFD400;
}

.submit-button {
  height: 50px;
  width: 125px;
  background-color: #FFD400;
  border-radius: 10px;
  display: grid;
  place-content: center;
  cursor: pointer;
  font-size: 20px;
  letter-spacing: 1px;
}

.submit-button:hover {
  background-color: #bea006;
}
</style>

../../utils/deploy