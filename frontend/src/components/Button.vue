<template>
    <button v-on:click=action class="border rounded-[15px] p-[10px] bg-[#FFD400] hover:bg-[#fff07c] text-[20px] tracking-[.15em] shadow-2xl">
        {{ buttonText }}
    </button>
</template>

<script>
export default {
    name: 'Button',
    props: {
        buttonText: String,
        action: Function,
        link: String,
    }
}
</script>