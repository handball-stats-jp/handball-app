# CourtEye

学生ハンドボールチーム向けの試合スタッツ分析Webアプリです。スマホのホーム画面に追加すると、アプリのように使えます(PWA対応)。

## できること
- 試合設定(チーム名・選手・日付・場所・YouTube動画URL)
- 試合中のライブ入力(得点・ターンオーバー・警告・2分退場・出場時間・OF/DFペア一括交代 など)
- 分析ダッシュボード(サマリー・選手別スタッツ・出場時間タイムライン・動画連携・レポート出力)
- 入力したデータはこの端末のブラウザに自動保存されます(リロードしても消えません)

---

## 1. 公開する(デプロイ)手順

一番簡単なのは Vercel を使う方法です(無料・数分で完了)。

### 方法A: Netlify Drop(一番簡単・アカウント登録の手間が少ない)
1. 手元のPCでこのフォルダを開き、ターミナルで以下を実行してビルドする
   ```
   npm install
   npm run build
   ```
2. `dist` フォルダが生成されるので、そのフォルダを https://app.netlify.com/drop にドラッグ&ドロップするだけ
3. 即座にURLが発行されます(無料)

### 方法B: GitHub経由でVercelにデプロイ(おすすめ・更新が楽)
1. このフォルダ一式をGitHubの新しいリポジトリにアップロードする
   - GitHubアカウントを作成 → 「New repository」→ 出来たリポジトリにこのフォルダの中身をアップロード
   - PCにGitが入っていれば:
     ```
     cd handball-app
     git init
     git add .
     git commit -m "first commit"
     git branch -M main
     git remote add origin https://github.com/【あなたのアカウント】/handball-app.git
     git push -u origin main
     ```
2. https://vercel.com で無料アカウントを作成(GitHubでログインすると楽です)
3. 「Add New...」→「Project」→ 先ほどのGitHubリポジトリを選択
4. そのまま「Deploy」を押すだけ(Viteプロジェクトは自動認識されます)
5. 数分で `https://handball-app-xxxx.vercel.app` のようなURLが発行されます

---

## 2. スマホのホーム画面にアプリとして追加する

発行されたURLにスマホのブラウザ(Safari / Chrome)でアクセスし、

- iPhone(Safari): 共有ボタン → 「ホーム画面に追加」
- Android(Chrome): メニュー(縦三点) → 「ホーム画面に追加」/「アプリをインストール」

これで、ホーム画面にアイコンが追加され、アプリのように起動できます。

---

## 3. 開発環境で試す(自分のPCで動作確認したい場合)

```
npm install
npm run dev
```

`http://localhost:5173` で確認できます。

---

## 4. 今後の拡張について

- 今はこの端末(ブラウザ)だけにデータが保存される仕組みです。複数端末・複数試合をまとめて管理したい場合は、Supabaseなどのデータベースと連携する仕組みを追加できます。
- 将来的にApp Store / Google Playへの配信も、Capacitorというツールでこのコードをそのままネイティブアプリの器に入れることができます。
