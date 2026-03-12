import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "スケマッチ！とは何ですか？",
    answer: "スケマッチ！は、登録不要で使える無料の日程調整ツールです。イベントの候補日時を設定し、参加者に共有するだけで、全員の都合を簡単にまとめることができます。",
  },
  {
    question: "ソレマッチ！とは何ですか？",
    answer: "ソレマッチ！は、登録不要で使えるシンプルな投票ツールです。選択肢を設定して参加者に共有するだけで、簡単にアンケートや多数決を行うことができます。",
  },
  {
    question: "会員登録は必要ですか？",
    answer: "いいえ、会員登録は不要です。スケマッチ！もソレマッチ！も、メールアドレスを入力するだけですぐにご利用いただけます。",
  },
  {
    question: "利用料金はかかりますか？",
    answer: "いいえ、すべての機能を無料でご利用いただけます。",
  },
  {
    question: "イベント（投票）の作成方法を教えてください",
    answer: "トップページからイベント名（または投票タイトル）、メールアドレス、候補日時（または選択肢）を入力して作成ボタンを押すだけです。作成後に表示されるリンクを参加者に共有してください。",
  },
  {
    question: "参加者にはどうやってリンクを共有しますか？",
    answer: "作成完了後に表示されるリンクをコピーするか、QRコードを共有してください。また、主催者のメールアドレスにも参加者用リンクが送信されます。",
  },
  {
    question: "参加者も会員登録が必要ですか？",
    answer: "いいえ、参加者も会員登録不要です。共有されたリンクを開いて、名前を入力し回答するだけで参加できます。",
  },
  {
    question: "回答があったときに通知は届きますか？",
    answer: "はい、参加者が回答するたびに、主催者のメールアドレスに通知メールが届きます。メールには回答者の一覧と集計結果へのリンクが含まれています。",
  },
  {
    question: "データはいつまで保存されますか？",
    answer: "入力されたデータはすべて作成日から1年後に自動的に削除されます。それ以前にデータの削除を希望される場合は、お問い合わせページよりご連絡ください。",
  },
  {
    question: "個人情報はどのように扱われますか？",
    answer: "収集する情報はサービス提供に必要な最小限の情報（メールアドレス、参加者名、日時情報など）のみです。詳しくはプライバシーポリシーをご覧ください。",
  },
];

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>よくある質問（FAQ） | スケマッチ！</title>
        <meta
          name="description"
          content="スケマッチ！・ソレマッチ！のよくある質問（FAQ）です。使い方、料金、データの保存期間、通知機能などについてお答えします。"
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link href="/">
            <Button variant="ghost" className="mb-8" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              トップページに戻る
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-8" data-testid="text-faq-title">
            よくある質問（FAQ）
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {faqItems.map((item, index) => (
              <section key={index} data-testid={`faq-item-${index}`}>
                <h2 className="text-lg font-semibold mb-2">
                  Q. {item.question}
                </h2>
                <p className="text-muted-foreground">
                  A. {item.answer}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
