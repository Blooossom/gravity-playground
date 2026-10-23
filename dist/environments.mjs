export const ENVIRONMENTS=Object.freeze({
 earth:{gravity:1,bounce:80,medium:'normal',label:'지구',note:'익숙한 지구, 1.0 g'},
 moon:{gravity:.2,bounce:80,medium:'normal',label:'달',note:'달처럼 가볍게, 0.2 g'},
 space:{gravity:0,bounce:98,medium:'normal',label:'무중력',note:'중력 OFF. 마음껏 둥둥.',kick:true},
 jupiter:{gravity:2.4,bounce:80,medium:'normal',label:'목성',note:'목성처럼 묵직하게, 2.4 g'},
 sun:{gravity:28,bounce:85,medium:'normal',label:'태양',note:'태양처럼 강렬하게, 28 g'},
 water:{gravity:.3,bounce:45,medium:'water',label:'수중',note:'물속처럼 천천히, 부드럽게.'},
 storm:{gravity:.3,bounce:90,medium:'storm',label:'태풍',note:'소용돌이를 타고 빙글빙글!',kick:true},
 chaos:{gravity:1.4,bounce:96,medium:'normal',label:'뒤죽박죽',note:'3초마다 중력이 돌아가요!',kick:true}
});
export function applyEnvironment(world,name){
 const env=ENVIRONMENTS[name];if(!env)throw new Error('Unknown environment');
 world.gx=0;world.gy=env.gravity*900;world.restitution=env.bounce/100;world.medium=env.medium;
 return env;
}
