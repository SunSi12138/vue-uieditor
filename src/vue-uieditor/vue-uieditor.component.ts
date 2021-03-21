import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  created(){
    console.warn('created', this);
  }
})
export default class VueUieditor extends Vue {
  @Prop() private msg!: string;

  created(){
    console.warn('this', this);
  }
}
