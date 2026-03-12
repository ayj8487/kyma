export interface ConversationScenario {
  id: string;
  title: string;
  titleJa: string;
  description: string;
  icon: string;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  role: "system" | "user_suggestion";
  japanese: string;
  reading: string;
  korean: string;
  userResponses?: { japanese: string; reading: string; korean: string }[];
}

export const conversationScenarios: ConversationScenario[] = [
  {
    id: "self-introduction",
    title: "자기소개",
    titleJa: "自己紹介",
    description: "일본어로 자기소개를 연습해 보세요",
    icon: "User",
    messages: [
      {
        role: "system",
        japanese: "こんにちは！はじめまして。私は田中です。お名前は何ですか？",
        reading: "こんにちは！はじめまして。わたしはたなかです。おなまえはなんですか？",
        korean: "안녕하세요! 처음 뵙겠습니다. 저는 다나카입니다. 이름이 무엇인가요?",
        userResponses: [
          { japanese: "はじめまして。私はキムです。", reading: "はじめまして。わたしはキムです。", korean: "처음 뵙겠습니다. 저는 김입니다." },
          { japanese: "こんにちは！私はパクと申します。", reading: "こんにちは！わたしはパクともうします。", korean: "안녕하세요! 저는 박이라고 합니다." },
          { japanese: "はじめまして。リーです。よろしくお願いします。", reading: "はじめまして。リーです。よろしくおねがいします。", korean: "처음 뵙겠습니다. 리입니다. 잘 부탁드립니다." },
        ],
      },
      {
        role: "system",
        japanese: "よろしくお願いします！どこから来ましたか？",
        reading: "よろしくおねがいします！どこからきましたか？",
        korean: "잘 부탁드립니다! 어디에서 오셨나요?",
        userResponses: [
          { japanese: "韓国から来ました。", reading: "かんこくからきました。", korean: "한국에서 왔습니다." },
          { japanese: "ソウルから来ました。", reading: "ソウルからきました。", korean: "서울에서 왔습니다." },
          { japanese: "韓国の釜山から来ました。", reading: "かんこくのプサンからきました。", korean: "한국 부산에서 왔습니다." },
        ],
      },
      {
        role: "system",
        japanese: "そうですか！韓国はいい国ですね。お仕事は何をしていますか？",
        reading: "そうですか！かんこくはいいくにですね。おしごとはなにをしていますか？",
        korean: "그렇군요! 한국은 좋은 나라네요. 직업이 무엇인가요?",
        userResponses: [
          { japanese: "学生です。大学で日本語を勉強しています。", reading: "がくせいです。だいがくでにほんごをべんきょうしています。", korean: "학생입니다. 대학에서 일본어를 공부하고 있습니다." },
          { japanese: "会社員です。IT会社で働いています。", reading: "かいしゃいんです。ITかいしゃではたらいています。", korean: "회사원입니다. IT 회사에서 일하고 있습니다." },
          { japanese: "先生です。英語を教えています。", reading: "せんせいです。えいごをおしえています。", korean: "선생님입니다. 영어를 가르치고 있습니다." },
        ],
      },
      {
        role: "system",
        japanese: "すごいですね！趣味は何ですか？",
        reading: "すごいですね！しゅみはなんですか？",
        korean: "대단하시네요! 취미가 무엇인가요?",
        userResponses: [
          { japanese: "音楽を聞くことが好きです。", reading: "おんがくをきくことがすきです。", korean: "음악 듣는 것을 좋아합니다." },
          { japanese: "映画を見ることと読書が好きです。", reading: "えいがをみることとどくしょがすきです。", korean: "영화 보는 것과 독서를 좋아합니다." },
          { japanese: "旅行が趣味です。日本にも行きたいです。", reading: "りょこうがしゅみです。にほんにもいきたいです。", korean: "여행이 취미입니다. 일본에도 가고 싶습니다." },
        ],
      },
      {
        role: "system",
        japanese: "いいですね！日本に来たことはありますか？",
        reading: "いいですね！にほんにきたことはありますか？",
        korean: "좋네요! 일본에 온 적이 있나요?",
        userResponses: [
          { japanese: "はい、去年東京に行きました。とても楽しかったです。", reading: "はい、きょねんとうきょうにいきました。とてもたのしかったです。", korean: "네, 작년에 도쿄에 갔습니다. 매우 즐거웠습니다." },
          { japanese: "いいえ、まだです。でも行きたいです。", reading: "いいえ、まだです。でもいきたいです。", korean: "아니요, 아직입니다. 하지만 가고 싶습니다." },
          { japanese: "はい、大阪と京都に行ったことがあります。", reading: "はい、おおさかときょうとにいったことがあります。", korean: "네, 오사카와 교토에 간 적이 있습니다." },
        ],
      },
      {
        role: "system",
        japanese: "お話しできて嬉しかったです。また会いましょう！",
        reading: "おはなしできてうれしかったです。またあいましょう！",
        korean: "이야기할 수 있어서 기뻤습니다. 또 만나요!",
        userResponses: [
          { japanese: "こちらこそ、ありがとうございました！", reading: "こちらこそ、ありがとうございました！", korean: "저야말로 감사합니다!" },
          { japanese: "楽しかったです。またお話ししましょう！", reading: "たのしかったです。またおはなししましょう！", korean: "즐거웠습니다. 또 이야기해요!" },
        ],
      },
    ],
  },
  {
    id: "restaurant",
    title: "레스토랑",
    titleJa: "レストラン",
    description: "레스토랑에서의 주문 연습을 해 보세요",
    icon: "UtensilsCrossed",
    messages: [
      {
        role: "system",
        japanese: "いらっしゃいませ！何名様ですか？",
        reading: "いらっしゃいませ！なんめいさまですか？",
        korean: "어서 오세요! 몇 분이신가요?",
        userResponses: [
          { japanese: "二人です。", reading: "ふたりです。", korean: "두 명입니다." },
          { japanese: "一人です。カウンター席はありますか？", reading: "ひとりです。カウンターせきはありますか？", korean: "한 명입니다. 카운터석이 있나요?" },
          { japanese: "三人です。窓側の席をお願いします。", reading: "さんにんです。まどがわのせきをおねがいします。", korean: "세 명입니다. 창가 자리 부탁합니다." },
        ],
      },
      {
        role: "system",
        japanese: "こちらへどうぞ。メニューです。ご注文はお決まりですか？",
        reading: "こちらへどうぞ。メニューです。ごちゅうもんはおきまりですか？",
        korean: "이쪽으로 오세요. 메뉴입니다. 주문하시겠습니까?",
        userResponses: [
          { japanese: "すみません、もう少し待ってください。", reading: "すみません、もうすこしまってください。", korean: "죄송합니다, 조금만 더 기다려 주세요." },
          { japanese: "おすすめは何ですか？", reading: "おすすめはなんですか？", korean: "추천 메뉴는 무엇인가요?" },
          { japanese: "はい、注文をお願いします。", reading: "はい、ちゅうもんをおねがいします。", korean: "네, 주문하겠습니다." },
        ],
      },
      {
        role: "system",
        japanese: "今日のおすすめは焼き魚定食です。とても新鮮ですよ。",
        reading: "きょうのおすすめはやきざかなていしょくです。とてもしんせんですよ。",
        korean: "오늘의 추천은 생선구이 정식입니다. 매우 신선하답니다.",
        userResponses: [
          { japanese: "じゃあ、それをお願いします。", reading: "じゃあ、それをおねがいします。", korean: "그럼, 그것으로 부탁합니다." },
          { japanese: "ラーメンはありますか？", reading: "ラーメンはありますか？", korean: "라멘은 있나요?" },
          { japanese: "焼き魚定食を一つと、味噌汁をお願いします。", reading: "やきざかなていしょくをひとつと、みそしるをおねがいします。", korean: "생선구이 정식 하나와 된장국 부탁합니다." },
        ],
      },
      {
        role: "system",
        japanese: "かしこまりました。お飲み物はいかがですか？",
        reading: "かしこまりました。おのみものはいかがですか？",
        korean: "알겠습니다. 음료는 어떠세요?",
        userResponses: [
          { japanese: "お水をお願いします。", reading: "おみずをおねがいします。", korean: "물 부탁합니다." },
          { japanese: "緑茶をください。", reading: "りょくちゃをください。", korean: "녹차를 주세요." },
          { japanese: "ビールを一つお願いします。", reading: "ビールをひとつおねがいします。", korean: "맥주 하나 부탁합니다." },
        ],
      },
      {
        role: "system",
        japanese: "お待たせしました。こちらが焼き魚定食です。ごゆっくりどうぞ。",
        reading: "おまたせしました。こちらがやきざかなていしょくです。ごゆっくりどうぞ。",
        korean: "오래 기다리셨습니다. 여기 생선구이 정식입니다. 천천히 드세요.",
        userResponses: [
          { japanese: "ありがとうございます。いただきます！", reading: "ありがとうございます。いただきます！", korean: "감사합니다. 잘 먹겠습니다!" },
          { japanese: "わあ、おいしそうですね！", reading: "わあ、おいしそうですね！", korean: "와, 맛있겠네요!" },
        ],
      },
      {
        role: "system",
        japanese: "お食事はいかがでしたか？",
        reading: "おしょくじはいかがでしたか？",
        korean: "식사는 어떠셨나요?",
        userResponses: [
          { japanese: "とてもおいしかったです！お会計をお願いします。", reading: "とてもおいしかったです！おかいけいをおねがいします。", korean: "매우 맛있었습니다! 계산 부탁합니다." },
          { japanese: "最高でした！ごちそうさまでした。", reading: "さいこうでした！ごちそうさまでした。", korean: "최고였습니다! 잘 먹었습니다." },
        ],
      },
    ],
  },
  {
    id: "shopping",
    title: "쇼핑",
    titleJa: "買い物",
    description: "일본에서 쇼핑할 때 사용하는 표현을 연습해 보세요",
    icon: "ShoppingBag",
    messages: [
      {
        role: "system",
        japanese: "いらっしゃいませ！何かお探しですか？",
        reading: "いらっしゃいませ！なにかおさがしですか？",
        korean: "어서 오세요! 찾으시는 게 있으신가요?",
        userResponses: [
          { japanese: "はい、Tシャツを探しています。", reading: "はい、Tシャツをさがしています。", korean: "네, 티셔츠를 찾고 있습니다." },
          { japanese: "ちょっと見ているだけです。", reading: "ちょっとみているだけです。", korean: "그냥 구경하는 중입니다." },
          { japanese: "お土産を探しています。", reading: "おみやげをさがしています。", korean: "기념품을 찾고 있습니다." },
        ],
      },
      {
        role: "system",
        japanese: "Tシャツはこちらにございます。どんな色がお好みですか？",
        reading: "Tシャツはこちらにございます。どんないろがおこのみですか？",
        korean: "티셔츠는 이쪽에 있습니다. 어떤 색상을 좋아하시나요?",
        userResponses: [
          { japanese: "青色が好きです。", reading: "あおいろがすきです。", korean: "파란색을 좋아합니다." },
          { japanese: "白か黒のシンプルなものはありますか？", reading: "しろかくろのシンプルなものはありますか？", korean: "흰색이나 검은색의 심플한 것이 있나요?" },
          { japanese: "赤いのを見せてください。", reading: "あかいのをみせてください。", korean: "빨간 것을 보여 주세요." },
        ],
      },
      {
        role: "system",
        japanese: "こちらの青いTシャツはいかがですか？今セール中で二割引きです。",
        reading: "こちらのあおいTシャツはいかがですか？いまセールちゅうでにわりびきです。",
        korean: "이 파란 티셔츠는 어떠세요? 지금 세일 중이라 20% 할인입니다.",
        userResponses: [
          { japanese: "いいですね。サイズはMがありますか？", reading: "いいですね。サイズはMがありますか？", korean: "좋네요. M 사이즈 있나요?" },
          { japanese: "試着してもいいですか？", reading: "しちゃくしてもいいですか？", korean: "입어 봐도 될까요?" },
          { japanese: "いくらですか？", reading: "いくらですか？", korean: "얼마인가요?" },
        ],
      },
      {
        role: "system",
        japanese: "Mサイズございます。試着室はあちらです。",
        reading: "Mサイズございます。しちゃくしつはあちらです。",
        korean: "M 사이즈 있습니다. 탈의실은 저쪽입니다.",
        userResponses: [
          { japanese: "ありがとうございます。試着してきます。", reading: "ありがとうございます。しちゃくしてきます。", korean: "감사합니다. 입어 보고 올게요." },
          { japanese: "すみません、Lサイズもお願いします。", reading: "すみません、Lサイズもおねがいします。", korean: "죄송합니다, L 사이즈도 부탁합니다." },
        ],
      },
      {
        role: "system",
        japanese: "お似合いですね！お買い上げになりますか？",
        reading: "おにあいですね！おかいあげになりますか？",
        korean: "잘 어울리시네요! 구매하시겠습니까?",
        userResponses: [
          { japanese: "はい、これをください。カードで払えますか？", reading: "はい、これをください。カードではらえますか？", korean: "네, 이것 주세요. 카드로 결제할 수 있나요?" },
          { japanese: "はい、お願いします。包んでもらえますか？", reading: "はい、おねがいします。つつんでもらえますか？", korean: "네, 부탁합니다. 포장해 주실 수 있나요?" },
          { japanese: "もう少し考えます。ありがとうございました。", reading: "もうすこしかんがえます。ありがとうございました。", korean: "좀 더 생각해 볼게요. 감사합니다." },
        ],
      },
      {
        role: "system",
        japanese: "はい、カードもご利用いただけます。ありがとうございました！またお越しください。",
        reading: "はい、カードもごりよういただけます。ありがとうございました！またおこしください。",
        korean: "네, 카드도 사용 가능합니다. 감사합니다! 또 오세요.",
        userResponses: [
          { japanese: "ありがとうございました！", reading: "ありがとうございました！", korean: "감사합니다!" },
        ],
      },
    ],
  },
  {
    id: "directions",
    title: "길찾기",
    titleJa: "道案内",
    description: "길을 물어보는 표현을 연습해 보세요",
    icon: "MapPin",
    messages: [
      {
        role: "system",
        japanese: "こんにちは！何かお手伝いしましょうか？",
        reading: "こんにちは！なにかおてつだいしましょうか？",
        korean: "안녕하세요! 도와드릴까요?",
        userResponses: [
          { japanese: "すみません、東京駅はどこですか？", reading: "すみません、とうきょうえきはどこですか？", korean: "실례합니다, 도쿄역은 어디인가요?" },
          { japanese: "すみません、近くにコンビニはありますか？", reading: "すみません、ちかくにコンビニはありますか？", korean: "실례합니다, 근처에 편의점이 있나요?" },
          { japanese: "すみません、この辺に銀行はありますか？", reading: "すみません、このへんにぎんこうはありますか？", korean: "실례합니다, 이 근처에 은행이 있나요?" },
        ],
      },
      {
        role: "system",
        japanese: "東京駅ですね。ここからまっすぐ行って、二つ目の信号を右に曲がってください。",
        reading: "とうきょうえきですね。ここからまっすぐいって、ふたつめのしんごうをみぎにまがってください。",
        korean: "도쿄역이군요. 여기서 직진해서 두 번째 신호등에서 오른쪽으로 꺾어 주세요.",
        userResponses: [
          { japanese: "まっすぐ行って、右ですね。ありがとうございます。", reading: "まっすぐいって、みぎですね。ありがとうございます。", korean: "직진해서 오른쪽이군요. 감사합니다." },
          { japanese: "歩いてどのくらいかかりますか？", reading: "あるいてどのくらいかかりますか？", korean: "걸어서 얼마나 걸리나요?" },
          { japanese: "すみません、もう一度お願いします。", reading: "すみません、もういちどおねがいします。", korean: "죄송합니다, 한 번 더 부탁합니다." },
        ],
      },
      {
        role: "system",
        japanese: "歩いて十分くらいです。大きな建物が見えたら、それが東京駅です。",
        reading: "あるいてじゅっぷんくらいです。おおきなたてものがみえたら、それがとうきょうえきです。",
        korean: "걸어서 10분 정도입니다. 큰 건물이 보이면 그것이 도쿄역입니다.",
        userResponses: [
          { japanese: "十分ですね。わかりました。", reading: "じゅっぷんですね。わかりました。", korean: "10분이군요. 알겠습니다." },
          { japanese: "バスで行けますか？", reading: "バスでいけますか？", korean: "버스로 갈 수 있나요?" },
          { japanese: "地図を描いてもらえますか？", reading: "ちずをかいてもらえますか？", korean: "지도를 그려 주실 수 있나요?" },
        ],
      },
      {
        role: "system",
        japanese: "バスもありますよ。あそこのバス停から3番のバスに乗ってください。三つ目で降りてください。",
        reading: "バスもありますよ。あそこのバスていからさんばんのバスにのってください。みっつめでおりてください。",
        korean: "버스도 있어요. 저기 버스 정류장에서 3번 버스를 타세요. 세 번째에서 내리세요.",
        userResponses: [
          { japanese: "3番のバスですね。ありがとうございます！", reading: "さんばんのバスですね。ありがとうございます！", korean: "3번 버스군요. 감사합니다!" },
          { japanese: "バスの料金はいくらですか？", reading: "バスのりょうきんはいくらですか？", korean: "버스 요금은 얼마인가요?" },
        ],
      },
      {
        role: "system",
        japanese: "二百円です。ICカードも使えますよ。気をつけて行ってくださいね。",
        reading: "にひゃくえんです。ICカードもつかえますよ。きをつけていってくださいね。",
        korean: "200엔입니다. IC카드도 사용할 수 있어요. 조심해서 가세요.",
        userResponses: [
          { japanese: "ご親切にありがとうございました！", reading: "ごしんせつにありがとうございました！", korean: "친절하게 감사합니다!" },
          { japanese: "助かりました。ありがとうございます！", reading: "たすかりました。ありがとうございます！", korean: "도움이 되었습니다. 감사합니다!" },
        ],
      },
    ],
  },
  {
    id: "hotel",
    title: "호텔",
    titleJa: "ホテル",
    description: "호텔 체크인과 관련된 표현을 연습해 보세요",
    icon: "Building2",
    messages: [
      {
        role: "system",
        japanese: "いらっしゃいませ。ご予約はされていますか？",
        reading: "いらっしゃいませ。ごよやくはされていますか？",
        korean: "어서 오세요. 예약하셨나요?",
        userResponses: [
          { japanese: "はい、キムの名前で予約しました。", reading: "はい、キムのなまえでよやくしました。", korean: "네, 김이라는 이름으로 예약했습니다." },
          { japanese: "いいえ、予約していません。空いている部屋はありますか？", reading: "いいえ、よやくしていません。あいているへやはありますか？", korean: "아니요, 예약하지 않았습니다. 빈 방이 있나요?" },
          { japanese: "はい、三泊で予約しています。", reading: "はい、さんぱくでよやくしています。", korean: "네, 3박으로 예약했습니다." },
        ],
      },
      {
        role: "system",
        japanese: "確認しました。シングルルームで三泊ですね。パスポートをお願いできますか？",
        reading: "かくにんしました。シングルルームでさんぱくですね。パスポートをおねがいできますか？",
        korean: "확인했습니다. 싱글룸으로 3박이군요. 여권을 보여 주시겠어요?",
        userResponses: [
          { japanese: "はい、どうぞ。", reading: "はい、どうぞ。", korean: "네, 여기 있습니다." },
          { japanese: "はい、こちらです。朝食は含まれていますか？", reading: "はい、こちらです。ちょうしょくはふくまれていますか？", korean: "네, 여기요. 조식이 포함되어 있나요?" },
        ],
      },
      {
        role: "system",
        japanese: "ありがとうございます。朝食は七時から九時半までです。一階のレストランでお召し上がりください。",
        reading: "ありがとうございます。ちょうしょくはしちじからくじはんまでです。いっかいのレストランでおめしあがりください。",
        korean: "감사합니다. 조식은 7시부터 9시 30분까지입니다. 1층 레스토랑에서 드세요.",
        userResponses: [
          { japanese: "わかりました。Wi-Fiはありますか？", reading: "わかりました。Wi-Fiはありますか？", korean: "알겠습니다. 와이파이 있나요?" },
          { japanese: "ありがとうございます。チェックアウトは何時ですか？", reading: "ありがとうございます。チェックアウトはなんじですか？", korean: "감사합니다. 체크아웃은 몇 시인가요?" },
        ],
      },
      {
        role: "system",
        japanese: "Wi-Fiは無料です。パスワードはお部屋のカードに書いてあります。チェックアウトは十一時までです。",
        reading: "Wi-Fiはむりょうです。パスワードはおへやのカードにかいてあります。チェックアウトはじゅういちじまでです。",
        korean: "와이파이는 무료입니다. 비밀번호는 방 카드에 적혀 있습니다. 체크아웃은 11시까지입니다.",
        userResponses: [
          { japanese: "わかりました。部屋は何階ですか？", reading: "わかりました。へやはなんかいですか？", korean: "알겠습니다. 방은 몇 층인가요?" },
          { japanese: "荷物を預けることはできますか？", reading: "にもつをあずけることはできますか？", korean: "짐을 맡길 수 있나요?" },
        ],
      },
      {
        role: "system",
        japanese: "お部屋は五階の502号室です。エレベーターはあちらです。何かあればフロントにお電話ください。",
        reading: "おへやはごかいの502ごうしつです。エレベーターはあちらです。なにかあればフロントにおでんわください。",
        korean: "방은 5층 502호실입니다. 엘리베이터는 저쪽입니다. 무엇이든 프런트에 전화해 주세요.",
        userResponses: [
          { japanese: "ありがとうございます。よろしくお願いします。", reading: "ありがとうございます。よろしくおねがいします。", korean: "감사합니다. 잘 부탁드립니다." },
          { japanese: "わかりました。ありがとうございます。", reading: "わかりました。ありがとうございます。", korean: "알겠습니다. 감사합니다." },
        ],
      },
      {
        role: "system",
        japanese: "ごゆっくりお過ごしください。良いご滞在を！",
        reading: "ごゆっくりおすごしください。よいごたいざいを！",
        korean: "편히 쉬세요. 좋은 숙박 되세요!",
        userResponses: [
          { japanese: "ありがとうございます！", reading: "ありがとうございます！", korean: "감사합니다!" },
        ],
      },
    ],
  },
];
