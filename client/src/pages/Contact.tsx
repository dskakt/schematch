import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            トップページに戻る
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">お問い合わせ・ご要望</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                お問い合わせ方法
              </CardTitle>
              <CardDescription>
                スケマッチに関するお問い合わせやご要望は、以下の方法で受け付けています。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">メールでのお問い合わせ</h3>
                <p className="text-muted-foreground mb-2">
                  以下のメールアドレスまでお気軽にご連絡ください。
                </p>
                <a 
                  href="mailto:schematch.office@gmail.com" 
                  className="text-primary hover:underline font-medium"
                  data-testid="link-email-contact"
                >
                  schematch.office@gmail.com
                </a>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">お問い合わせの際にご記入いただきたい内容</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>お名前</li>
                  <li>メールアドレス</li>
                  <li>お問い合わせ内容（できるだけ詳しくお書きください）</li>
                  <li>該当するイベントのURL（該当する場合）</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">対応時間</h3>
                <p className="text-muted-foreground">
                  お問い合わせへの返信は、通常1〜3営業日以内に行います。お急ぎの場合でも、できる限り早く対応させていただきますが、内容によっては回答にお時間をいただく場合がございます。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>よくあるご質問</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Q. イベントを削除したい</h3>
                <p className="text-muted-foreground">
                  A. 現在、イベントの削除機能は実装されておりません。ご要望として承りますので、お問い合わせください。
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Q. 回答内容を修正したい</h3>
                <p className="text-muted-foreground">
                  A. 参加者は同じリンクから再度回答することで、回答内容を更新できます。最新の回答が反映されます。
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Q. メールが届かない</h3>
                <p className="text-muted-foreground">
                  A. 迷惑メールフォルダをご確認ください。それでも見つからない場合は、メールアドレスが正しく入力されているかご確認の上、お問い合わせください。
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Q. 新機能の要望はできますか？</h3>
                <p className="text-muted-foreground">
                  A. はい、大歓迎です！ご要望は上記のメールアドレスまでお送りください。すべてのご要望にお応えすることはできませんが、サービス改善の参考にさせていただきます。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
