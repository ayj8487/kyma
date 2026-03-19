"use client";

import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileQuestion,
  Target,
  Flame,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useStudyStore } from "@/store/useStudyStore";

const quickAccessCards = [
  {
    href: "/kana/hiragana",
    label: "히라가나",
    description: "기본 문자 학습",
    icon: BookOpen,
    color: "from-pink-500 to-rose-400",
  },
  {
    href: "/kana/katakana",
    label: "가타카나",
    description: "외래어 문자 학습",
    icon: BookOpen,
    color: "from-purple-500 to-violet-400",
  },
  {
    href: "/words",
    label: "단어",
    description: "어휘력 키우기",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-400",
  },
  {
    href: "/quiz",
    label: "퀴즈",
    description: "실력 테스트",
    icon: FileQuestion,
    color: "from-emerald-500 to-teal-400",
  },
];

const meigen = [
  { text: "継続は力なり。", reading: "けいぞくはちからなり", korean: "계속하는 것이 힘이다." },
  { text: "七転び八起き。", reading: "ななころびやおき", korean: "일곱 번 넘어져도 여덟 번 일어나라." },
  { text: "一期一会。", reading: "いちごいちえ", korean: "일생에 단 한 번의 만남." },
  { text: "石の上にも三年。", reading: "いしのうえにもさんねん", korean: "돌 위에도 삼 년이면 따뜻해진다." },
  { text: "塵も積もれば山となる。", reading: "ちりもつもればやまとなる", korean: "티끌 모아 태산." },
  { text: "急がば回れ。", reading: "いそがばまわれ", korean: "급할수록 돌아가라." },
  { text: "千里の道も一歩から。", reading: "せんりのみちもいっぽから", korean: "천리 길도 한 걸음부터." },
  { text: "失敗は成功のもと。", reading: "しっぱいはせいこうのもと", korean: "실패는 성공의 어머니." },
  { text: "明日は明日の風が吹く。", reading: "あしたはあしたのかぜがふく", korean: "내일은 내일의 바람이 분다." },
  { text: "時は金なり。", reading: "ときはかねなり", korean: "시간은 금이다." },
  { text: "初心忘るべからず。", reading: "しょしんわするべからず", korean: "초심을 잊지 말아라." },
  { text: "雨降って地固まる。", reading: "あめふってじかたまる", korean: "비 온 뒤에 땅이 굳는다." },
  { text: "笑う門には福来る。", reading: "わらうかどにはふくきたる", korean: "웃는 집에 복이 온다." },
  { text: "井の中の蛙大海を知らず。", reading: "いのなかのかわずたいかいをしらず", korean: "우물 안 개구리 큰 바다를 모른다." },
  { text: "百聞は一見に如かず。", reading: "ひゃくぶんはいっけんにしかず", korean: "백 번 듣는 것보다 한 번 보는 게 낫다." },
  { text: "努力は裏切らない。", reading: "どりょくはうらぎらない", korean: "노력은 배신하지 않는다." },
  { text: "自分を信じろ。", reading: "じぶんをしんじろ", korean: "자신을 믿어라." },
  { text: "夢は逃げない、逃げるのはいつも自分だ。", reading: "ゆめはにげない、にげるのはいつもじぶんだ", korean: "꿈은 도망치지 않는다, 도망치는 건 항상 자신이다." },
  { text: "今日できることを明日に延ばすな。", reading: "きょうできることをあしたにのばすな", korean: "오늘 할 수 있는 일을 내일로 미루지 마라." },
  { text: "一日一歩、三日で三歩。", reading: "いちにちいっぽ、みっかでさんぽ", korean: "하루에 한 걸음, 사흘이면 세 걸음." },
  { text: "為せば成る。", reading: "なせばなる", korean: "하면 된다." },
  { text: "学問に王道なし。", reading: "がくもんにおうどうなし", korean: "학문에 왕도는 없다." },
  { text: "練習は本番のように、本番は練習のように。", reading: "れんしゅうはほんばんのように、ほんばんはれんしゅうのように", korean: "연습은 실전처럼, 실전은 연습처럼." },
  { text: "小さなことを積み重ねることが大きなことにつながる。", reading: "ちいさなことをつみかさねることがおおきなことにつながる", korean: "작은 것을 쌓아가는 것이 큰 것으로 이어진다." },
  { text: "涙の数だけ強くなれる。", reading: "なみだのかずだけつよくなれる", korean: "흘린 눈물만큼 강해질 수 있다." },
  { text: "人生に遅すぎることはない。", reading: "じんせいにおそすぎることはない", korean: "인생에 너무 늦은 것은 없다." },
  { text: "やらない後悔よりやる後悔。", reading: "やらないこうかいよりやるこうかい", korean: "안 한 후회보다 한 후회가 낫다." },
  { text: "一生懸命は美しい。", reading: "いっしょうけんめいはうつくしい", korean: "열심히 하는 것은 아름답다." },
  { text: "可能性は無限大。", reading: "かのうせいはむげんだい", korean: "가능성은 무한대다." },
  { text: "今を生きる。", reading: "いまをいきる", korean: "지금을 살아라." },
  { text: "何事も始めなければ始まらない。", reading: "なにごともはじめなければはじまらない", korean: "무슨 일이든 시작하지 않으면 시작되지 않는다." },
  { text: "弱い自分に勝つことが本当の強さだ。", reading: "よわいじぶんにかつことがほんとうのつよさだ", korean: "약한 자신을 이기는 것이 진정한 강함이다." },
  { text: "花は咲く。いつか必ず。", reading: "はなはさく。いつかかならず", korean: "꽃은 핀다. 언젠가 반드시." },
  { text: "一歩ずつ前に進もう。", reading: "いっぽずつまえにすすもう", korean: "한 걸음씩 앞으로 나아가자." },
  { text: "変わることを恐れるな。", reading: "かわることをおそれるな", korean: "변하는 것을 두려워하지 마라." },
  { text: "挑戦しなければ何も得られない。", reading: "ちょうせんしなければなにもえられない", korean: "도전하지 않으면 아무것도 얻을 수 없다." },
  { text: "心が変われば行動が変わる。", reading: "こころがかわればこうどうがかわる", korean: "마음이 바뀌면 행동이 바뀐다." },
  { text: "後悔先に立たず。", reading: "こうかいさきにたたず", korean: "후회는 먼저 서지 않는다." },
  { text: "光あるところに影がある。", reading: "ひかりあるところにかげがある", korean: "빛이 있는 곳에 그림자가 있다." },
  { text: "己を知り、敵を知れば百戦危うからず。", reading: "おのれをしり、てきをしればひゃくせんあやうからず", korean: "나를 알고 적을 알면 백 번 싸워도 위태롭지 않다." },
  { text: "朝の来ない夜はない。", reading: "あさのこないよるはない", korean: "아침이 오지 않는 밤은 없다." },
  { text: "壁は乗り越えるためにある。", reading: "かべはのりこえるためにある", korean: "벽은 넘기 위해 있다." },
  { text: "感謝の気持ちを忘れずに。", reading: "かんしゃのきもちをわすれずに", korean: "감사하는 마음을 잊지 말자." },
  { text: "人は見かけによらず。", reading: "ひとはみかけによらず", korean: "사람은 겉모습으로 판단할 수 없다." },
  { text: "知識は力なり。", reading: "ちしきはちからなり", korean: "지식은 힘이다." },
  { text: "十人十色。", reading: "じゅうにんといろ", korean: "열 사람 열 색깔." },
  { text: "以心伝心。", reading: "いしんでんしん", korean: "마음에서 마음으로 전한다." },
  { text: "温故知新。", reading: "おんこちしん", korean: "옛것을 익히고 새것을 안다." },
  { text: "一所懸命頑張ろう。", reading: "いっしょけんめいがんばろう", korean: "열심히 힘내자." },
  { text: "待てば海路の日和あり。", reading: "まてばかいろのひよりあり", korean: "기다리면 바닷길에도 좋은 날이 온다." },
  { text: "能ある鷹は爪を隠す。", reading: "のうあるたかはつめをかくす", korean: "능력 있는 매는 발톱을 숨긴다." },
  { text: "猿も木から落ちる。", reading: "さるもきからおちる", korean: "원숭이도 나무에서 떨어진다." },
  { text: "実るほど頭を垂れる稲穂かな。", reading: "みのるほどあたまをたれるいなほかな", korean: "익을수록 고개를 숙이는 벼이삭." },
  { text: "目標を持つことが成功の第一歩だ。", reading: "もくひょうをもつことがせいこうのだいいっぽだ", korean: "목표를 갖는 것이 성공의 첫걸음이다." },
  { text: "困難は分割せよ。", reading: "こんなんはぶんかつせよ", korean: "어려움은 나눠서 대처하라." },
  { text: "友達は宝物だ。", reading: "ともだちはたからものだ", korean: "친구는 보물이다." },
  { text: "思い立ったが吉日。", reading: "おもいたったがきちじつ", korean: "생각이 떠올랐을 때가 길일." },
  { text: "過去を悔やむより未来を信じろ。", reading: "かこをくやむよりみらいをしんじろ", korean: "과거를 후회하기보다 미래를 믿어라." },
  { text: "好きこそものの上手なれ。", reading: "すきこそもののじょうずなれ", korean: "좋아하면 잘하게 된다." },
  { text: "言葉には力がある。", reading: "ことばにはちからがある", korean: "말에는 힘이 있다." },
  { text: "誠実さが信頼を生む。", reading: "せいじつさがしんらいをうむ", korean: "성실함이 신뢰를 만든다." },
  { text: "毎日少しずつ成長しよう。", reading: "まいにちすこしずつせいちょうしよう", korean: "매일 조금씩 성장하자." },
  { text: "困った時こそ笑え。", reading: "こまったときこそわらえ", korean: "곤란할 때일수록 웃어라." },
  { text: "昨日の自分を超えろ。", reading: "きのうのじぶんをこえろ", korean: "어제의 나를 넘어서라." },
  { text: "夢を叶えるのは自分自身だ。", reading: "ゆめをかなえるのはじぶんじしんだ", korean: "꿈을 이루는 건 자기 자신이다." },
  { text: "苦あれば楽あり。", reading: "くあればらくあり", korean: "고생 끝에 낙이 온다." },
  { text: "習うより慣れろ。", reading: "ならうよりなれろ", korean: "배우기보다 익혀라." },
  { text: "柔よく剛を制す。", reading: "じゅうよくごうをせいす", korean: "부드러운 것이 강한 것을 이긴다." },
  { text: "虎穴に入らずんば虎子を得ず。", reading: "こけつにいらずんばこじをえず", korean: "호랑이 굴에 들어가지 않으면 호랑이 새끼를 얻지 못한다." },
  { text: "二兎を追う者は一兎をも得ず。", reading: "にとをおうものはいっとをもえず", korean: "두 마리 토끼를 쫓는 자는 한 마리도 잡지 못한다." },
  { text: "情けは人の為ならず。", reading: "なさけはひとのためならず", korean: "남에게 베푸는 정은 결국 자기에게 돌아온다." },
  { text: "出る杭は打たれる。", reading: "でるくいはうたれる", korean: "튀어나온 못은 맞는다." },
  { text: "蛙の子は蛙。", reading: "かえるのこはかえる", korean: "개구리 자식은 개구리." },
  { text: "花より団子。", reading: "はなよりだんご", korean: "꽃보다 경단. (실리를 추구함)" },
  { text: "三日坊主にならないように。", reading: "みっかぼうずにならないように", korean: "작심삼일이 되지 않도록." },
  { text: "案ずるより産むが易し。", reading: "あんずるよりうむがやすし", korean: "걱정하는 것보다 실행하는 게 쉽다." },
  { text: "天は自ら助くる者を助く。", reading: "てんはみずからたすくるものをたすく", korean: "하늘은 스스로 돕는 자를 돕는다." },
  { text: "志あるところに道は開ける。", reading: "こころざしあるところにみちはひらける", korean: "뜻이 있는 곳에 길이 열린다." },
  { text: "今日の一針、明日の十針。", reading: "きょうのひとはり、あしたのとはり", korean: "오늘의 한 바늘, 내일의 열 바늘." },
  { text: "自分の限界は自分で決めるな。", reading: "じぶんのげんかいはじぶんできめるな", korean: "자신의 한계를 스스로 정하지 마라." },
  { text: "悩んでいる暇があったら動け。", reading: "なやんでいるひまがあったらうごけ", korean: "고민할 시간이 있으면 움직여라." },
  { text: "始めるのに完璧を待つな。", reading: "はじめるのにかんぺきをまつな", korean: "시작하는데 완벽을 기다리지 마라." },
  { text: "負けて覚える相撲かな。", reading: "まけておぼえるすもうかな", korean: "져야 배우는 스모." },
  { text: "口は災いの元。", reading: "くちはわざわいのもと", korean: "입은 재앙의 근원." },
  { text: "転んでもただでは起きぬ。", reading: "ころんでもただではおきぬ", korean: "넘어져도 그냥 일어나지 않는다." },
  { text: "人生は一度きりだ。", reading: "じんせいはいちどきりだ", korean: "인생은 한 번뿐이다." },
  { text: "焦らず、怠らず、欺かず。", reading: "あせらず、おこたらず、あざむかず", korean: "서두르지 말고, 게으르지 말고, 속이지 마라." },
  { text: "明けない夜はない。", reading: "あけないよるはない", korean: "밝아지지 않는 밤은 없다." },
  { text: "運命は自分で切り開くものだ。", reading: "うんめいはじぶんできりひらくものだ", korean: "운명은 스스로 개척하는 것이다." },
  { text: "今日が人生で一番若い日だ。", reading: "きょうがじんせいでいちばんわかいひだ", korean: "오늘이 인생에서 가장 젊은 날이다." },
  { text: "笑顔は最高の武器だ。", reading: "えがおはさいこうのぶきだ", korean: "미소는 최고의 무기다." },
  { text: "他人と比べるな、昨日の自分と比べろ。", reading: "たにんとくらべるな、きのうのじぶんとくらべろ", korean: "남과 비교하지 마라, 어제의 나와 비교해라." },
  { text: "諦めなければ失敗ではない。", reading: "あきらめなければしっぱいではない", korean: "포기하지 않으면 실패가 아니다." },
  { text: "言い訳をしない人間になれ。", reading: "いいわけをしないにんげんになれ", korean: "변명하지 않는 사람이 되어라." },
  { text: "大事なのは結果ではなく過程だ。", reading: "だいじなのはけっかではなくかていだ", korean: "중요한 건 결과가 아니라 과정이다." },
  { text: "見える景色は登った人にしか分からない。", reading: "みえるけしきはのぼったひとにしかわからない", korean: "보이는 경치는 올라간 사람만 알 수 있다." },
  { text: "今の苦しみは未来の糧になる。", reading: "いまのくるしみはみらいのかてになる", korean: "지금의 고통은 미래의 양식이 된다." },
  { text: "日々是好日。", reading: "にちにちこれこうじつ", korean: "날마다 좋은 날." },
  { text: "不言実行。", reading: "ふげんじっこう", korean: "말하지 않고 실행한다." },
  { text: "有言実行。", reading: "ゆうげんじっこう", korean: "말한 것을 실행한다." },
  { text: "大器晩成。", reading: "たいきばんせい", korean: "큰 그릇은 늦게 완성된다." },
  { text: "切磋琢磨。", reading: "せっさたくま", korean: "서로 갈고닦다." },
  { text: "風林火山。", reading: "ふうりんかざん", korean: "바람, 숲, 불, 산처럼." },
  { text: "臥薪嘗胆。", reading: "がしんしょうたん", korean: "와신상담. 복수를 위해 고난을 참다." },
  { text: "明鏡止水。", reading: "めいきょうしすい", korean: "맑은 거울과 고요한 물. 잡념이 없는 마음." },
  { text: "弱肉強食の世界で優しさを持て。", reading: "じゃくにくきょうしょくのせかいでやさしさをもて", korean: "약육강식의 세계에서 상냥함을 가져라." },
  { text: "夢中になれるものを見つけよう。", reading: "むちゅうになれるものをみつけよう", korean: "열중할 수 있는 것을 찾자." },
  { text: "遠回りこそが近道だ。", reading: "とおまわりこそがちかみちだ", korean: "돌아가는 것이야말로 지름길이다." },
  { text: "無理をしない、でも諦めない。", reading: "むりをしない、でもあきらめない", korean: "무리하지 않되, 포기하지 않는다." },
  { text: "泣いた分だけ笑える日が来る。", reading: "ないたぶんだけわらえるひがくる", korean: "운 만큼 웃을 수 있는 날이 온다." },
  { text: "世界は広い、もっと見に行こう。", reading: "せかいはひろい、もっとみにいこう", korean: "세계는 넓다, 더 보러 가자." },
  { text: "小さな幸せを大切にしよう。", reading: "ちいさなしあわせをたいせつにしよう", korean: "작은 행복을 소중히 하자." },
  { text: "考えるよりまず行動しろ。", reading: "かんがえるよりまずこうどうしろ", korean: "생각하기보다 먼저 행동해라." },
  { text: "完璧じゃなくていい、前に進めばいい。", reading: "かんぺきじゃなくていい、まえにすすめばいい", korean: "완벽하지 않아도 돼, 앞으로 나아가면 돼." },
  { text: "強い者が勝つのではない、勝った者が強いのだ。", reading: "つよいものがかつのではない、かったものがつよいのだ", korean: "강한 자가 이기는 게 아니라, 이긴 자가 강한 것이다." },
  { text: "人の痛みが分かる人間になれ。", reading: "ひとのいたみがわかるにんげんになれ", korean: "남의 아픔을 아는 사람이 되어라." },
  { text: "迷ったら、困難な道を選べ。", reading: "まよったら、こんなんなみちをえらべ", korean: "망설이면, 어려운 길을 선택해라." },
  { text: "勝ちに不思議の勝ちあり、負けに不思議の負けなし。", reading: "かちにふしぎのかちあり、まけにふしぎのまけなし", korean: "이김에 불가사의한 이김이 있으나, 짐에 불가사의한 짐은 없다." },
  { text: "真剣に遊べ。", reading: "しんけんにあそべ", korean: "진지하게 놀아라." },
  { text: "ありがとうは魔法の言葉。", reading: "ありがとうはまほうのことば", korean: "'고마워'는 마법의 말." },
  { text: "逆境こそがチャンスだ。", reading: "ぎゃっきょうこそがチャンスだ", korean: "역경이야말로 기회다." },
  { text: "自分を愛することが第一歩だ。", reading: "じぶんをあいすることがだいいっぽだ", korean: "자신을 사랑하는 것이 첫걸음이다." },
  { text: "忘れないで、君は一人じゃない。", reading: "わすれないで、きみはひとりじゃない", korean: "잊지 마, 넌 혼자가 아니야." },
  { text: "どん底から見上げる空は美しい。", reading: "どんぞこからみあげるそらはうつくしい", korean: "밑바닥에서 올려다보는 하늘은 아름답다." },
  { text: "返事は「はい」か「Yes」だけだ。", reading: "へんじは「はい」か「Yes」だけだ", korean: "대답은 '네' 아니면 'Yes'뿐이다." },
  { text: "道なき道を切り開け。", reading: "みちなきみちをきりひらけ", korean: "길 없는 길을 개척해라." },
  { text: "笑って泣いて、それが人生だ。", reading: "わらってないて、それがじんせいだ", korean: "웃고 울고, 그게 인생이다." },
  { text: "本気でやれば大抵のことはできる。", reading: "ほんきでやればたいていのことはできる", korean: "진심으로 하면 대부분의 일은 할 수 있다." },
  { text: "準備ができた時にチャンスは来る。", reading: "じゅんびができたときにチャンスはくる", korean: "준비가 되었을 때 기회가 온다." },
];

const kaomoji = [
  "(｡･ω･)ﾉﾞ", "(◕‿◕✿)", "٩(◕‿◕)۶", "(ノ´ヮ`)ノ*:・゚✧",
  "ヽ(>∀<☆)ノ", "(๑•̀ㅂ•́)و✧", "( •̀ᴗ•́ )و", "(ﾉ◕ヮ◕)ﾉ*:・゚✧",
  "(*≧▽≦)", "(≧◡≦)", "ヾ(＾∇＾)", "(｡♥‿♥｡)",
  "( ´ ▽ ` )ﾉ", "✧٩(ˊωˋ*)و✧", "(＾▽＾)ノ", "ヽ(´▽`)/",
  "(*^‿^*)", "(◠‿◠)", "٩(^‿^)۶", "(ᵔᴥᵔ)",
  "(づ｡◕‿‿◕｡)づ", "(ﾉ´ з `)ノ", "(っ˘ω˘ς)", "♪(´ε` )",
  "(*´▽`*)", "(☆▽☆)", "(*⁰▿⁰*)", "\\(★ω★)/",
  "(ง •̀_•́)ง", "(•̀ᴗ•́)و ̑̑", "ᕦ(ò_óˇ)ᕤ", "(ノ°∀°)ノ⌒",
  "(*´∀`)~♥", "(=^・^=)", "(✿◠‿◠)", "(*˘︶˘*).｡.:*♡",
  "(ﾟ∀ﾟ)", "( ˘ω˘ )", "(´• ω •`)ﾉ", "(*・ω・)ﾉ",
  "(⌐■_■)", "(☞ﾟヮﾟ)☞", "☜(ﾟヮﾟ☜)", "(ง'̀-'́)ง",
  "( ◡‿◡ *)", "ヽ(♡‿♡)ノ", "(ﾉ◕ヮ◕)ﾉ", "(*¯︶¯*)",
  "~(˘▾˘~)", "(~˘▾˘)~", "┗(＾0＾)┓", "♪♪(o*゜∇゜)o",
  "(っ´▽`)っ", "⊂(◉‿◉)つ", "(≧∇≦)ﾉ", "(✧ω✧)",
  "(ﾟ▽ﾟ)/", "(￣▽￣)ノ", "(σ≧▽≦)σ", "(*≧ω≦)",
  "(ﾉ≧∀≦)ﾉ", "ヽ(*≧ω≦)ﾉ", "(๑˃̵ᴗ˂̵)", "(๑>◡<๑)",
  "(≧◡≦) ♡", "( ˊᵕˋ )♡", "(◍•ᴗ•◍)❤", "♡(ˊ͈ ꇴ ˋ͈)♡",
  "(•‿•)", "(◠ᴗ◠)", "(´,,•ω•,,)♡", "(ˊ˘ˋ*)",
  "(*˘◡˘*)", "(❁´◡`❁)", "✿(◕‿◕✿)", "(❀◕‿◕❀)",
  "╰(*´︶`*)╯", "♬♩♪◖(● _● )◗♪♩♬", "(ﾉ*ФωФ)ﾉ", "(=｀ω´=)",
  "ʕ•ᴥ•ʔ", "ʕ￫ᴥ￩ʔ", "(*oωo)", "(◕ᴗ◕✿)",
  "(*≧∀≦*)", "(っ^▿^)っ", "(ノ*>∀<)ノ", "☆*:.｡.o(≧▽≦)o.｡.:*☆",
  "(•̀ᴗ•́)✧", "( ╹▽╹ )", "(◕‿◕)♡", "ﾟ+.ﾟ(´▽`人)",
  "ε=ε=(ノ≧∇≦)ノ", "(°▽°)/", "( ˃̣̣̥ω˂̣̣̥ )", "(*´ω｀*)",
  "(=ﾟωﾟ)ﾉ", "(^ω^)", "(´∀`)", "(* ˃ ᵕ ˂ )b",
  "⸜( ´ ꒳ ` )⸝♡", "(ᵕ̤ᴗᵕ̤)", "(*ˊᗜˋ*)", "(⁎˃ᴗ˂⁎)",
  "ᐠ( ᐛ )ᐟ", "(*ꆤ.̫ꆤ*)", "(✪ω✪)", "( ﾟ∀ ﾟ)ﾉｼ",
];

const getDayIndex = () => {
  const now = new Date();
  const start = new Date(2025, 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
};

export default function DashboardPage() {
  const {
    progress,
    streakCount,
    todayStudyCount,
    todayDate,
    getCorrectRate,
  } = useStudyStore();

  const today = new Date().toISOString().split("T")[0];
  const displayStudyCount = todayDate === today ? todayStudyCount : 0;

  const kanaEntries = Object.values(progress).filter(
    (p) => p.contentType === "hiragana" || p.contentType === "katakana"
  );
  const wordEntries = Object.values(progress).filter(
    (p) => p.contentType === "word"
  );
  const correctRate = getCorrectRate();

  const stats = [
    {
      label: "학습한 가나 수",
      value: kanaEntries.length,
      unit: "개",
      icon: BookOpen,
      accent: "text-sakura-500",
      bg: "bg-sakura-50 dark:bg-sakura-100",
    },
    {
      label: "학습한 단어 수",
      value: wordEntries.length,
      unit: "개",
      icon: GraduationCap,
      accent: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "퀴즈 정답률",
      value: correctRate,
      unit: "%",
      icon: Target,
      accent: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "연속 학습일",
      value: streakCount,
      unit: "일",
      icon: Flame,
      accent: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 今日の名言 */}
        {(() => {
          const idx = getDayIndex();
          const todayMeigen = meigen[((idx % meigen.length) + meigen.length) % meigen.length];
          const todayKaomoji = kaomoji[((idx % kaomoji.length) + kaomoji.length) % kaomoji.length];
          return (
            <div className="mb-8">
              <p className="text-xs text-indigo-400 mb-1">今日の名言（きょうのめいげん）</p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {todayMeigen.text}
              </h1>
              <p className="text-xs text-gray-400 mt-1">{todayMeigen.reading}</p>
              <p className="text-sm text-gray-500 mt-0.5">{todayMeigen.korean}</p>
              <p className="mt-2 text-accent-indigo dark:text-warm-400">
                꾸준한 학습이 실력 향상의 비결입니다 {todayKaomoji}
              </p>
            </div>
          );
        })()}

        {/* Today's Study Count */}
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-sakura-200 bg-gradient-to-r from-sakura-50 to-warm-50 p-4 dark:border-sakura-300 dark:from-sakura-100 dark:to-warm-100 sm:p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sakura-100 dark:bg-sakura-200">
            <Zap size={24} className="text-sakura-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-accent-indigo dark:text-warm-400">
              오늘의 학습
            </p>
            <p className="text-2xl font-bold text-foreground">
              {displayStudyCount}
              <span className="ml-1 text-base font-normal text-accent-indigo dark:text-warm-400">
                회
              </span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, unit, icon: Icon, accent, bg }) => (
            <div
              key={label}
              className="rounded-2xl border border-warm-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-warm-200 dark:bg-warm-100"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${bg}`}>
                  <Icon size={20} className={accent} />
                </div>
                <TrendingUp size={16} className="text-warm-400" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {value}
                  <span className="ml-0.5 text-sm font-normal text-accent-indigo dark:text-warm-400">
                    {unit}
                  </span>
                </p>
                <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="mb-5 text-xl font-bold text-foreground">
            빠른 학습
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickAccessCards.map(
              ({ href, label, description, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative overflow-hidden rounded-2xl border border-warm-200 bg-white p-6 transition-all hover:border-sakura-200 hover:shadow-lg dark:border-warm-200 dark:bg-warm-100 dark:hover:border-sakura-300"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {label}
                  </h3>
                  <p className="mt-1 text-sm text-accent-indigo dark:text-warm-400">
                    {description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-sakura-500 transition-transform group-hover:translate-x-1">
                    학습하기
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
