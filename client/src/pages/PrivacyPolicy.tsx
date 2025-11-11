import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            トップページに戻る
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">個人情報の取り扱いについて</h2>
            <p className="text-muted-foreground">
              スケジュールマッチング（スケマッチ）（以下、「当サービス」）は、ユーザーの個人情報を適切に取り扱うため、以下のプライバシーポリシーを定めます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">1. 収集する情報</h2>
            <p className="text-muted-foreground mb-2">当サービスでは、以下の情報を収集します。</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>イベント主催者のメールアドレス</li>
              <li>参加者の名前</li>
              <li>イベントのタイトル</li>
              <li>選択された日時情報</li>
              <li>参加者の備考欄に入力された情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. 情報の利用目的</h2>
            <p className="text-muted-foreground mb-2">収集した個人情報は、以下の目的で利用します。</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>日程調整サービスの提供</li>
              <li>主催者への通知メールの送信</li>
              <li>イベント参加者への回答結果の表示</li>
              <li>サービスの改善および新機能の開発</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. 情報の共有</h2>
            <p className="text-muted-foreground">
              当サービスは、法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。ただし、イベントの主催者と参加者の間では、日程調整のために必要な情報（参加者名、選択された日時、備考）が共有されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. 情報の保存期間</h2>
            <p className="text-muted-foreground">
              イベント情報および参加者の回答データは、サービスの提供に必要な期間保存されます。ユーザーからの削除要請があった場合、または法令で定められた保存期間が経過した場合、速やかに削除します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. セキュリティ</h2>
            <p className="text-muted-foreground">
              当サービスは、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を実施しています。データベースへのアクセスは暗号化された接続を通じて行われ、不正アクセスを防止する仕組みを導入しています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. クッキー（Cookie）</h2>
            <p className="text-muted-foreground">
              当サービスは、サービスの利便性向上のためにクッキーを使用する場合があります。クッキーの使用を望まない場合は、ブラウザの設定で無効にすることができますが、一部の機能が利用できなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. プライバシーポリシーの変更</h2>
            <p className="text-muted-foreground">
              当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本サービス上に掲載した時点で効力を生じます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. お問い合わせ</h2>
            <p className="text-muted-foreground">
              個人情報の取り扱いに関するお問い合わせは、お問い合わせページよりご連絡ください。
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-12">
            制定日：2025年11月11日
          </p>
        </div>
      </div>
    </div>
  );
}
