/**
* Chatworkの事前準備
* １．グループチャットにBOTアカウントを追加する
*
* Gmailでの事前準備
* １．"NOTI"ラベルを作成する
* ２．通知対象のメールに"NOTI"のラベルが付加されるようにフィルタの設定する
*
* 設定一覧
* CHATWORK_TOKEN	：Chatwork APIのAPIトークン（BOTアカウントのトークン）
* CHATWORK_ROOM_ID	：送信するグループチャットID
* REPLY_TO_UIDS		：TOに入れるUIDを設定
* TITLE_NOTI		：[title]に設定する文字列
* LABEL_NOTI		：Gmailに設定する通知対象のラベル
*/
var CHATWORK_TOKEN = "e685ad0bb04e309723d9bf4cef36b2d8",
    CHATWORK_ROOM_ID = "90984261",
    CONTENT_MAX_LINE = 14,
    REPLY_TO_UIDS = [
      9999999,
    ],
    TITLE_NOTI = "タイトル",
    LABEL_NOTI = "NOTI";

/**
* notifier | 通知
*/
function notifier() {
  var targetLabel, notifiedLabel, threads, thread, messages;
      
  targetLabel = GmailApp.getUserLabelByName(LABEL_NOTI);
      
  threads = targetLabel.getThreads().reverse();

  for (var i in threads) {
    thread = threads[i];
    messages = thread.getMessages().reverse();
    for (var j in messages) {
      // このメッセージが未読であるかどうかをチェックします。
      if (messages[j].isUnread() == true) {
        notify(messages[j], CHATWORK_NOTI_ROOM_ID);
        // メッセージを読み取り済みとしてマークします。
        messages[j].markRead();
      }
    }
    thread.removeLabel(targetLabel);
  }  
  Logger.log("DONE");
}


/**
* Chatworkへ通知する
*/
function notify(message, roomID) {
  var cw = ChatWorkClient.factory({token: CHATWORK_TOKEN});
  try {
    cw.sendMessage({room_id: roomID, body: format(message)});
  } catch (e) {
    Logger.log(e.message);
    throw new e;
  }
}

/**
 * 通知先、送信メッセージを編集する
 */
function format(message) {
  var replyHeader, content, uids;
  
  // 通知先を設定
  uids = REPLY_TO_UIDS;
  
  replyHeader = generateReplyTargets(uids);
  content = generateContent(message)
  return replyHeader.length > 0 ? replyHeader + "\n" + content : content;
}

/**
 * メッセージを編集する
 */
function generateContent(message) {
  var subject = message.getSubject(),
      body = message.getPlainBody().trim(),
      date = message.getDate(),
      title = "",
      postLength = 0,
      startPos = 0,
      endPos = 0;
  
  title = TITLE_NOTI;
  
  return "[info][title]" + title + "[/title]" + "【 " + subject + " 】\n" + date + "\n" + body + "[/info]";
}

/**
 * 通知先を編集する
 */
function generateReplyTargets(uid_list) {
  var reply = '';
  
  for (var i = 0; i < uid_list.length; ++i) {
    reply = reply + '[To:' + uid_list[i] + '] ';
    // 名前文字列を付与
    switch (uid_list[i]) {
      case 9999999:
        reply = reply + 'hogeさん';
        break;
    }
    reply = reply + '\n';
  }
  return reply.trim();
}