import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>利用規約 | スケマッチ！</title>
        <meta name="description" content="スケマッチ！の利用規約です。本サービスをご利用いただく際の条件、禁止事項、免責事項などについて記載しています。" />
      </Helmet>
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            トップページに戻る
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">利用規約</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">第1条（適用）</h2>
            <p className="text-muted-foreground">
              本規約は、本サービスの利用に関する条件を、本サービスを利用するすべてのユーザーと当サービス運営者との間で定めるものです。本サービスをご利用いただく際には、本規約の全文をお読みいただいた上で、本規約に同意いただく必要があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第2条（サービス内容）</h2>
            <p className="text-muted-foreground">
              本サービスは、イベントの日程調整を支援するウェブアプリケーションです。ユーザーは本サービスを通じて、イベントの候補日時を設定し、参加者から回答を収集することができます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第3条（禁止事項）</h2>
            <p className="text-muted-foreground mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>その他、当サービス運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第4条（免責事項）</h2>
            <p className="text-muted-foreground">
              当サービス運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第5条（サービス内容の変更等）</h2>
            <p className="text-muted-foreground">
              当サービス運営者は、ユーザーに通知することなく、本サービスの内容を変更、または本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第6条（利用規約の変更）</h2>
            <p className="text-muted-foreground">
              当サービス運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の本規約は、本サービス上に表示した時点より効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">第7条（準拠法・裁判管轄）</h2>
            <p className="text-muted-foreground">
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当サービス運営者の所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-12">
            制定日：2025年11月11日
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
