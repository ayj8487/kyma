"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Volume2, BookOpen } from "lucide-react";
import { speakJapanese } from "@/lib/tts";

interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  jlptLevel: string;
  explanation: string;
  formation: string;
  examples: { japanese: string; reading: string; korean: string }[];
  tags: string[];
}

const n5Grammar: GrammarPoint[] = [
  { id: "g-n5-1", pattern: "～です", meaning: "~입니다", jlptLevel: "N5", explanation: "명사나 형용사 뒤에 붙어 정중한 문장을 만듭니다.", formation: "명사 + です", examples: [{ japanese: "学生です。", reading: "がくせいです。", korean: "학생입니다." }, { japanese: "これは本です。", reading: "これはほんです。", korean: "이것은 책입니다." }], tags: ["기초", "정중체"] },
  { id: "g-n5-2", pattern: "～ます", meaning: "~합니다 (동사 정중형)", jlptLevel: "N5", explanation: "동사의 정중한 형태입니다. ます형으로 변환하여 사용합니다.", formation: "동사 ます형", examples: [{ japanese: "食べます。", reading: "たべます。", korean: "먹습니다." }, { japanese: "行きます。", reading: "いきます。", korean: "갑니다." }], tags: ["기초", "정중체"] },
  { id: "g-n5-3", pattern: "～ません", meaning: "~하지 않습니다 (부정)", jlptLevel: "N5", explanation: "동사의 정중한 부정형입니다.", formation: "동사 ます형 + ません", examples: [{ japanese: "食べません。", reading: "たべません。", korean: "먹지 않습니다." }, { japanese: "行きません。", reading: "いきません。", korean: "가지 않습니다." }], tags: ["기초", "부정"] },
  { id: "g-n5-4", pattern: "～ました", meaning: "~했습니다 (과거)", jlptLevel: "N5", explanation: "동사의 정중한 과거형입니다.", formation: "동사 ます형 + ました", examples: [{ japanese: "食べました。", reading: "たべました。", korean: "먹었습니다." }, { japanese: "見ました。", reading: "みました。", korean: "봤습니다." }], tags: ["기초", "과거"] },
  { id: "g-n5-5", pattern: "～は～です", meaning: "~은/는 ~입니다 (주제)", jlptLevel: "N5", explanation: "は는 주제를 나타내는 조사입니다. 문장의 화제를 설정합니다.", formation: "명사 + は + 명사/형용사 + です", examples: [{ japanese: "私は学生です。", reading: "わたしはがくせいです。", korean: "저는 학생입니다." }, { japanese: "東京は大きいです。", reading: "とうきょうはおおきいです。", korean: "도쿄는 큽니다." }], tags: ["조사", "기초"] },
  { id: "g-n5-6", pattern: "～が", meaning: "~이/가 (주어)", jlptLevel: "N5", explanation: "주어를 나타내는 조사입니다. 새로운 정보나 강조할 때 사용합니다.", formation: "명사 + が", examples: [{ japanese: "猫がいます。", reading: "ねこがいます。", korean: "고양이가 있습니다." }, { japanese: "誰が来ましたか。", reading: "だれがきましたか。", korean: "누가 왔습니까?" }], tags: ["조사"] },
  { id: "g-n5-7", pattern: "～を", meaning: "~을/를 (목적어)", jlptLevel: "N5", explanation: "동작의 대상(목적어)을 나타내는 조사입니다.", formation: "명사 + を + 동사", examples: [{ japanese: "本を読みます。", reading: "ほんをよみます。", korean: "책을 읽습니다." }, { japanese: "水を飲みます。", reading: "みずをのみます。", korean: "물을 마십니다." }], tags: ["조사"] },
  { id: "g-n5-8", pattern: "～に", meaning: "~에 (방향/시간)", jlptLevel: "N5", explanation: "방향, 시간, 존재 장소를 나타냅니다.", formation: "명사 + に", examples: [{ japanese: "学校に行きます。", reading: "がっこうにいきます。", korean: "학교에 갑니다." }, { japanese: "7時に起きます。", reading: "しちじにおきます。", korean: "7시에 일어납니다." }], tags: ["조사"] },
  { id: "g-n5-9", pattern: "～で", meaning: "~에서/~으로 (장소/수단)", jlptLevel: "N5", explanation: "동작이 이루어지는 장소나 수단을 나타냅니다.", formation: "명사 + で", examples: [{ japanese: "図書館で勉強します。", reading: "としょかんでべんきょうします。", korean: "도서관에서 공부합니다." }, { japanese: "バスで行きます。", reading: "バスでいきます。", korean: "버스로 갑니다." }], tags: ["조사"] },
  { id: "g-n5-10", pattern: "～と", meaning: "~와/과 (병렬/동반)", jlptLevel: "N5", explanation: "사물의 나열이나 함께 하는 사람을 나타냅니다.", formation: "명사 + と + 명사 / 명사 + と + 동사", examples: [{ japanese: "パンとコーヒー", reading: "パンとコーヒー", korean: "빵과 커피" }, { japanese: "友達と遊びます。", reading: "ともだちとあそびます。", korean: "친구와 놉니다." }], tags: ["조사"] },
  { id: "g-n5-11", pattern: "～も", meaning: "~도 (추가)", jlptLevel: "N5", explanation: "'도'라는 의미로 추가 정보를 나타냅니다.", formation: "명사 + も", examples: [{ japanese: "私も学生です。", reading: "わたしもがくせいです。", korean: "저도 학생입니다." }, { japanese: "これも美味しいです。", reading: "これもおいしいです。", korean: "이것도 맛있습니다." }], tags: ["조사"] },
  { id: "g-n5-12", pattern: "～から", meaning: "~부터/~때문에", jlptLevel: "N5", explanation: "시간/장소의 시작점 또는 이유를 나타냅니다.", formation: "명사 + から / 문장 + から", examples: [{ japanese: "9時から始まります。", reading: "くじからはじまります。", korean: "9시부터 시작됩니다." }, { japanese: "暑いから窓を開けます。", reading: "あついからまどをあけます。", korean: "더우니까 창문을 엽니다." }], tags: ["조사", "접속"] },
  { id: "g-n5-13", pattern: "～まで", meaning: "~까지", jlptLevel: "N5", explanation: "시간/장소의 끝점을 나타냅니다.", formation: "명사 + まで", examples: [{ japanese: "5時まで勉強します。", reading: "ごじまでべんきょうします。", korean: "5시까지 공부합니다." }, { japanese: "東京まで行きます。", reading: "とうきょうまでいきます。", korean: "도쿄까지 갑니다." }], tags: ["조사"] },
  { id: "g-n5-14", pattern: "～の", meaning: "~의 (소유/수식)", jlptLevel: "N5", explanation: "소유나 명사 수식을 나타냅니다.", formation: "명사 + の + 명사", examples: [{ japanese: "私の本", reading: "わたしのほん", korean: "나의 책" }, { japanese: "日本の文化", reading: "にほんのぶんか", korean: "일본의 문화" }], tags: ["조사"] },
  { id: "g-n5-15", pattern: "～か", meaning: "~입니까? (의문)", jlptLevel: "N5", explanation: "문장 끝에 붙어 의문문을 만듭니다.", formation: "문장 + か", examples: [{ japanese: "これは何ですか。", reading: "これはなんですか。", korean: "이것은 무엇입니까?" }, { japanese: "日本人ですか。", reading: "にほんじんですか。", korean: "일본인입니까?" }], tags: ["의문"] },
  { id: "g-n5-16", pattern: "～ている", meaning: "~하고 있다 (진행/상태)", jlptLevel: "N5", explanation: "진행 중인 동작이나 결과 상태를 나타냅니다.", formation: "동사 て형 + いる", examples: [{ japanese: "食べている。", reading: "たべている。", korean: "먹고 있다." }, { japanese: "住んでいます。", reading: "すんでいます。", korean: "살고 있습니다." }], tags: ["동사", "진행"] },
  { id: "g-n5-17", pattern: "～てください", meaning: "~해 주세요 (요청)", jlptLevel: "N5", explanation: "상대방에게 정중하게 부탁할 때 사용합니다.", formation: "동사 て형 + ください", examples: [{ japanese: "見てください。", reading: "みてください。", korean: "봐 주세요." }, { japanese: "教えてください。", reading: "おしえてください。", korean: "가르쳐 주세요." }], tags: ["요청", "정중체"] },
  { id: "g-n5-18", pattern: "～たい", meaning: "~하고 싶다 (희망)", jlptLevel: "N5", explanation: "화자 자신의 희망을 나타냅니다.", formation: "동사 ます형 + たい", examples: [{ japanese: "日本に行きたいです。", reading: "にほんにいきたいです。", korean: "일본에 가고 싶습니다." }, { japanese: "寿司を食べたい。", reading: "すしをたべたい。", korean: "초밥을 먹고 싶다." }], tags: ["희망"] },
  { id: "g-n5-19", pattern: "～ないでください", meaning: "~하지 마세요 (금지요청)", jlptLevel: "N5", explanation: "상대방에게 하지 말라고 정중하게 요청합니다.", formation: "동사 ない형 + でください", examples: [{ japanese: "触らないでください。", reading: "さわらないでください。", korean: "만지지 마세요." }, { japanese: "心配しないでください。", reading: "しんぱいしないでください。", korean: "걱정하지 마세요." }], tags: ["금지", "요청"] },
  { id: "g-n5-20", pattern: "～なければならない", meaning: "~해야 한다 (의무)", jlptLevel: "N5", explanation: "의무나 필요성을 나타냅니다.", formation: "동사 ない형 → なければならない", examples: [{ japanese: "勉強しなければならない。", reading: "べんきょうしなければならない。", korean: "공부해야 한다." }, { japanese: "早く起きなければなりません。", reading: "はやくおきなければなりません。", korean: "일찍 일어나야 합니다." }], tags: ["의무"] },
  { id: "g-n5-21", pattern: "～てもいい", meaning: "~해도 된다 (허가)", jlptLevel: "N5", explanation: "허가를 나타냅니다.", formation: "동사 て형 + もいい", examples: [{ japanese: "入ってもいいですか。", reading: "はいってもいいですか。", korean: "들어가도 됩니까?" }, { japanese: "写真を撮ってもいいですか。", reading: "しゃしんをとってもいいですか。", korean: "사진을 찍어도 됩니까?" }], tags: ["허가"] },
  { id: "g-n5-22", pattern: "～てはいけない", meaning: "~하면 안 된다 (금지)", jlptLevel: "N5", explanation: "금지를 나타냅니다.", formation: "동사 て형 + はいけない", examples: [{ japanese: "ここで食べてはいけません。", reading: "ここでたべてはいけません。", korean: "여기서 먹으면 안 됩니다." }, { japanese: "走ってはいけません。", reading: "はしってはいけません。", korean: "뛰면 안 됩니다." }], tags: ["금지"] },
  { id: "g-n5-23", pattern: "～ことができる", meaning: "~할 수 있다 (가능)", jlptLevel: "N5", explanation: "능력이나 가능성을 나타냅니다.", formation: "동사 사전형 + ことができる", examples: [{ japanese: "日本語を話すことができます。", reading: "にほんごをはなすことができます。", korean: "일본어를 말할 수 있습니다." }, { japanese: "泳ぐことができます。", reading: "およぐことができます。", korean: "수영할 수 있습니다." }], tags: ["가능"] },
  { id: "g-n5-24", pattern: "～つもり", meaning: "~할 생각이다 (의도)", jlptLevel: "N5", explanation: "계획이나 의도를 나타냅니다.", formation: "동사 사전형 + つもり", examples: [{ japanese: "来年日本に行くつもりです。", reading: "らいねんにほんにいくつもりです。", korean: "내년에 일본에 갈 생각입니다." }, { japanese: "大学に入るつもりです。", reading: "だいがくにはいるつもりです。", korean: "대학에 들어갈 생각입니다." }], tags: ["의도"] },
  { id: "g-n5-25", pattern: "～ましょう", meaning: "~합시다 (권유)", jlptLevel: "N5", explanation: "함께 하자고 권유할 때 사용합니다.", formation: "동사 ます형 + ましょう", examples: [{ japanese: "一緒に行きましょう。", reading: "いっしょにいきましょう。", korean: "함께 갑시다." }, { japanese: "食べましょう。", reading: "たべましょう。", korean: "먹읍시다." }], tags: ["권유"] },
  { id: "g-n5-26", pattern: "～でしょう", meaning: "~이겠지요 (추측)", jlptLevel: "N5", explanation: "추측이나 확인을 나타냅니다.", formation: "문장 + でしょう", examples: [{ japanese: "明日は雨でしょう。", reading: "あしたはあめでしょう。", korean: "내일은 비가 오겠지요." }, { japanese: "美味しいでしょう。", reading: "おいしいでしょう。", korean: "맛있겠지요." }], tags: ["추측"] },
  { id: "g-n5-27", pattern: "～と思う", meaning: "~라고 생각하다", jlptLevel: "N5", explanation: "자신의 의견이나 생각을 나타냅니다.", formation: "문장(보통형) + と思う", examples: [{ japanese: "日本語は面白いと思います。", reading: "にほんごはおもしろいとおもいます。", korean: "일본어는 재미있다고 생각합니다." }, { japanese: "彼は来ると思います。", reading: "かれはくるとおもいます。", korean: "그가 올 거라고 생각합니다." }], tags: ["의견"] },
  { id: "g-n5-28", pattern: "～ね", meaning: "~네요 (확인/공감)", jlptLevel: "N5", explanation: "상대방에게 확인하거나 공감을 구할 때 사용합니다.", formation: "문장 + ね", examples: [{ japanese: "いい天気ですね。", reading: "いいてんきですね。", korean: "좋은 날씨네요." }, { japanese: "美味しいですね。", reading: "おいしいですね。", korean: "맛있네요." }], tags: ["종조사"] },
  { id: "g-n5-29", pattern: "～よ", meaning: "~요 (강조/알림)", jlptLevel: "N5", explanation: "상대방에게 새로운 정보를 알려주거나 강조할 때 사용합니다.", formation: "문장 + よ", examples: [{ japanese: "これは美味しいですよ。", reading: "これはおいしいですよ。", korean: "이거 맛있어요." }, { japanese: "明日テストがありますよ。", reading: "あしたテストがありますよ。", korean: "내일 시험이 있어요." }], tags: ["종조사"] },
  { id: "g-n5-30", pattern: "～が好きです", meaning: "~을/를 좋아합니다", jlptLevel: "N5", explanation: "좋아하는 것을 나타냅니다.", formation: "명사 + が好きです", examples: [{ japanese: "日本語が好きです。", reading: "にほんごがすきです。", korean: "일본어를 좋아합니다." }, { japanese: "映画が好きです。", reading: "えいががすきです。", korean: "영화를 좋아합니다." }], tags: ["형용사", "감정"] },
];

const n4Grammar: GrammarPoint[] = [
  { id: "g-n4-1", pattern: "～ようにする", meaning: "~하도록 하다", jlptLevel: "N4", explanation: "습관을 들이거나 노력하는 것을 나타냅니다.", formation: "동사 사전형/ない형 + ようにする", examples: [{ japanese: "毎日運動するようにしています。", reading: "まいにちうんどうするようにしています。", korean: "매일 운동하도록 하고 있습니다." }, { japanese: "遅れないようにします。", reading: "おくれないようにします。", korean: "늦지 않도록 하겠습니다." }], tags: ["노력", "습관"] },
  { id: "g-n4-2", pattern: "～ようになる", meaning: "~하게 되다", jlptLevel: "N4", explanation: "상태의 변화를 나타냅니다.", formation: "동사 사전형/ない형 + ようになる", examples: [{ japanese: "日本語が話せるようになりました。", reading: "にほんごがはなせるようになりました。", korean: "일본어를 말할 수 있게 되었습니다." }, { japanese: "泳げるようになった。", reading: "およげるようになった。", korean: "수영할 수 있게 되었다." }], tags: ["변화"] },
  { id: "g-n4-3", pattern: "～ことにする", meaning: "~하기로 하다 (결정)", jlptLevel: "N4", explanation: "자신의 결정을 나타냅니다.", formation: "동사 사전형/ない형 + ことにする", examples: [{ japanese: "留学することにしました。", reading: "りゅうがくすることにしました。", korean: "유학하기로 했습니다." }, { japanese: "お酒を飲まないことにした。", reading: "おさけをのまないことにした。", korean: "술을 마시지 않기로 했다." }], tags: ["결정"] },
  { id: "g-n4-4", pattern: "～ことになる", meaning: "~하게 되다 (결과)", jlptLevel: "N4", explanation: "외부 요인에 의한 결정을 나타냅니다.", formation: "동사 사전형 + ことになる", examples: [{ japanese: "来月転勤することになりました。", reading: "らいげつてんきんすることになりました。", korean: "다음 달 전근하게 되었습니다." }, { japanese: "日本に行くことになった。", reading: "にほんにいくことになった。", korean: "일본에 가게 되었다." }], tags: ["결과", "결정"] },
  { id: "g-n4-5", pattern: "～そうだ (様態)", meaning: "~할 것 같다 (외관)", jlptLevel: "N4", explanation: "외관이나 상황으로부터의 추측을 나타냅니다.", formation: "동사 ます형/형용사 어간 + そうだ", examples: [{ japanese: "雨が降りそうです。", reading: "あめがふりそうです。", korean: "비가 올 것 같습니다." }, { japanese: "美味しそうですね。", reading: "おいしそうですね。", korean: "맛있을 것 같네요." }], tags: ["추측", "외관"] },
  { id: "g-n4-6", pattern: "～そうだ (伝聞)", meaning: "~라고 한다 (전문)", jlptLevel: "N4", explanation: "다른 사람에게서 들은 정보를 전달합니다.", formation: "문장(보통형) + そうだ", examples: [{ japanese: "明日雪が降るそうです。", reading: "あしたゆきがふるそうです。", korean: "내일 눈이 온다고 합니다." }, { japanese: "あの映画は面白いそうです。", reading: "あのえいがはおもしろいそうです。", korean: "그 영화는 재미있다고 합니다." }], tags: ["전문", "간접화법"] },
  { id: "g-n4-7", pattern: "～ようだ", meaning: "~인 것 같다", jlptLevel: "N4", explanation: "근거에 기반한 추측을 나타냅니다.", formation: "문장(보통형) + ようだ", examples: [{ japanese: "彼は忙しいようです。", reading: "かれはいそがしいようです。", korean: "그는 바쁜 것 같습니다." }, { japanese: "雨が降っているようだ。", reading: "あめがふっているようだ。", korean: "비가 오고 있는 것 같다." }], tags: ["추측"] },
  { id: "g-n4-8", pattern: "～らしい", meaning: "~인 것 같다/~답다", jlptLevel: "N4", explanation: "전해들은 정보에 기반한 추측입니다.", formation: "문장(보통형) + らしい / 명사 + らしい", examples: [{ japanese: "彼は医者らしいです。", reading: "かれはいしゃらしいです。", korean: "그는 의사인 것 같습니다." }, { japanese: "春らしい天気ですね。", reading: "はるらしいてんきですね。", korean: "봄다운 날씨네요." }], tags: ["추측", "성질"] },
  { id: "g-n4-9", pattern: "～ばかり", meaning: "~만/~뿐", jlptLevel: "N4", explanation: "한 가지만 하는 것이나 방금 한 것을 나타냅니다.", formation: "동사 た형 + ばかり / 명사 + ばかり", examples: [{ japanese: "ゲームばかりしている。", reading: "ゲームばかりしている。", korean: "게임만 하고 있다." }, { japanese: "来たばかりです。", reading: "きたばかりです。", korean: "막 왔습니다." }], tags: ["한정"] },
  { id: "g-n4-10", pattern: "～はず", meaning: "~일 것이다/~일 터이다", jlptLevel: "N4", explanation: "논리적 근거에 기반한 확신을 나타냅니다.", formation: "문장(보통형) + はず", examples: [{ japanese: "彼はもう着いたはずです。", reading: "かれはもうついたはずです。", korean: "그는 이미 도착했을 것입니다." }, { japanese: "まだ開いているはずです。", reading: "まだあいているはずです。", korean: "아직 열려 있을 것입니다." }], tags: ["확신", "추측"] },
  { id: "g-n4-11", pattern: "～ために", meaning: "~하기 위해 (목적)", jlptLevel: "N4", explanation: "목적을 나타냅니다.", formation: "동사 사전형 + ために / 명사 + のために", examples: [{ japanese: "日本語を学ぶために日本に来ました。", reading: "にほんごをまなぶためににほんにきました。", korean: "일본어를 배우기 위해 일본에 왔습니다." }, { japanese: "健康のために運動します。", reading: "けんこうのためにうんどうします。", korean: "건강을 위해 운동합니다." }], tags: ["목적"] },
  { id: "g-n4-12", pattern: "～ように", meaning: "~하도록 (목적/바람)", jlptLevel: "N4", explanation: "간접적 목적이나 바람을 나타냅니다.", formation: "동사 사전형/ない형 + ように", examples: [{ japanese: "忘れないように書いておきます。", reading: "わすれないようにかいておきます。", korean: "잊지 않도록 적어 놓겠습니다." }, { japanese: "聞こえるように大きい声で話してください。", reading: "きこえるようにおおきいこえではなしてください。", korean: "들리도록 큰 소리로 말해 주세요." }], tags: ["목적"] },
  { id: "g-n4-13", pattern: "～ても", meaning: "~해도 (양보)", jlptLevel: "N4", explanation: "양보/역접을 나타냅니다.", formation: "동사 て형 + も / 형용사 + ても", examples: [{ japanese: "雨が降っても行きます。", reading: "あめがふってもいきます。", korean: "비가 와도 갑니다." }, { japanese: "高くても買います。", reading: "たかくてもかいます。", korean: "비싸도 삽니다." }], tags: ["양보", "역접"] },
  { id: "g-n4-14", pattern: "～のに", meaning: "~인데도 (역접)", jlptLevel: "N4", explanation: "예상과 다른 결과를 나타내며 불만이나 의외성을 표현합니다.", formation: "문장(보통형) + のに", examples: [{ japanese: "勉強したのに不合格でした。", reading: "べんきょうしたのにふごうかくでした。", korean: "공부했는데 불합격이었습니다." }, { japanese: "約束したのに来なかった。", reading: "やくそくしたのにこなかった。", korean: "약속했는데 오지 않았다." }], tags: ["역접", "불만"] },
  { id: "g-n4-15", pattern: "～し", meaning: "~하고/~이기도 하고 (이유나열)", jlptLevel: "N4", explanation: "이유를 나열하거나 여러 사항을 열거합니다.", formation: "문장(보통형) + し", examples: [{ japanese: "安いし美味しいし、このレストランが好きです。", reading: "やすいしおいしいし、このレストランがすきです。", korean: "싸기도 하고 맛있기도 해서 이 레스토랑을 좋아합니다." }], tags: ["이유", "나열"] },
  { id: "g-n4-16", pattern: "～ながら", meaning: "~하면서 (동시동작)", jlptLevel: "N4", explanation: "두 동작을 동시에 하는 것을 나타냅니다.", formation: "동사 ます형 + ながら", examples: [{ japanese: "音楽を聞きながら勉強します。", reading: "おんがくをききながらべんきょうします。", korean: "음악을 들으면서 공부합니다." }, { japanese: "歩きながら話します。", reading: "あるきながらはなします。", korean: "걸으면서 이야기합니다." }], tags: ["동시동작"] },
  { id: "g-n4-17", pattern: "～たら", meaning: "~하면/~했더니 (조건)", jlptLevel: "N4", explanation: "조건이나 가정을 나타냅니다.", formation: "동사 た형 + ら", examples: [{ japanese: "雨が降ったら中止です。", reading: "あめがふったらちゅうしです。", korean: "비가 오면 중지입니다." }, { japanese: "家に帰ったら電話します。", reading: "いえにかえったらでんわします。", korean: "집에 돌아가면 전화하겠습니다." }], tags: ["조건"] },
  { id: "g-n4-18", pattern: "～ば", meaning: "~하면 (조건)", jlptLevel: "N4", explanation: "일반적 조건을 나타냅니다.", formation: "동사 ば형", examples: [{ japanese: "春になれば桜が咲きます。", reading: "はるになればさくらがさきます。", korean: "봄이 되면 벚꽃이 핍니다." }, { japanese: "安ければ買います。", reading: "やすければかいます。", korean: "싸면 삽니다." }], tags: ["조건"] },
  { id: "g-n4-19", pattern: "～なら", meaning: "~라면 (조건/화제)", jlptLevel: "N4", explanation: "화제를 조건으로 제시합니다.", formation: "문장(보통형) + なら", examples: [{ japanese: "日本に行くなら京都がおすすめです。", reading: "にほんにいくならきょうとがおすすめです。", korean: "일본에 간다면 교토를 추천합니다." }, { japanese: "車なら30分です。", reading: "くるまならさんじゅっぷんです。", korean: "차라면 30분입니다." }], tags: ["조건", "화제"] },
  { id: "g-n4-20", pattern: "～させる", meaning: "~시키다 (사역)", jlptLevel: "N4", explanation: "다른 사람에게 어떤 행동을 시키는 것을 나타냅니다.", formation: "동사 사역형", examples: [{ japanese: "子供に野菜を食べさせます。", reading: "こどもにやさいをたべさせます。", korean: "아이에게 채소를 먹게 합니다." }, { japanese: "学生に本を読ませます。", reading: "がくせいにほんをよませます。", korean: "학생에게 책을 읽게 합니다." }], tags: ["사역"] },
];

export default function GrammarLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("전체");

  const grammarList = level === "N5" ? n5Grammar : level === "N4" ? n4Grammar : [];

  const allTags = ["전체", ...Array.from(new Set(grammarList.flatMap((g) => g.tags)))];
  const filteredGrammar = selectedTag === "전체"
    ? grammarList
    : grammarList.filter((g) => g.tags.includes(selectedTag));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/grammar" className="text-violet-600 hover:underline text-sm flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> 문법 목록
          </Link>
          <h1 className="text-3xl font-bold">JLPT {level} 문법</h1>
          <p className="text-gray-500 mt-1">총 {grammarList.length}개 문법 포인트</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTag === tag
                ? "bg-violet-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredGrammar.map((g) => {
          const isExpanded = expandedId === g.id;
          return (
            <div key={g.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedId(isExpanded ? null : g.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-violet-100 text-violet-700 w-10 h-10 rounded-lg flex items-center justify-center">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-violet-700">{g.pattern}</span>
                    <span className="text-gray-500 ml-3 text-sm">{g.meaning}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {g.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-violet-50 text-violet-600 text-xs rounded-full hidden sm:inline">
                      {t}
                    </span>
                  ))}
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t bg-gray-50">
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">설명</h3>
                      <p className="text-gray-600 text-sm">{g.explanation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">접속 방법</h3>
                      <p className="text-violet-700 text-sm font-mono bg-violet-50 inline-block px-3 py-1 rounded">{g.formation}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">예문</h3>
                      <div className="space-y-2">
                        {g.examples.map((ex, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border">
                            <div className="flex items-center gap-2">
                              <p className="text-base font-medium">{ex.japanese}</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); speakJapanese(ex.japanese); }}
                                className="text-violet-500 hover:text-violet-700 p-1"
                                title="발음 듣기"
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{ex.reading}</p>
                            <p className="text-sm text-gray-600 mt-1">{ex.korean}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGrammar.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>해당 태그의 문법이 없습니다</p>
        </div>
      )}
    </div>
  );
}
