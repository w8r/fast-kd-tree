export default {
  onStart (event) { console.log(this.name); },
  onError (event) { console.log(event.target.error); },
  onCycle (event) {
    console.log(' -', String(event.target), `mean ${(event.target.stats.mean * 1000).toFixed(3)}ms`);
  },
  onComplete() {
    console.log('- Fastest is ' + this.filter('fastest').map('name') + '\n');
  }
}
