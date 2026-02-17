const { withAndroidManifest } = require("@expo/config-plugins");

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Strips BOOT_COMPLETED intent actions from the expo-notifications
 * NotificationsService receiver. Android 15+ restricts starting certain
 * foreground service types (like media playback) from BOOT_COMPLETED
 * receivers, which causes crashes and Play Store rejection.
 *
 * See: https://github.com/expo/expo/issues/41627
 */
module.exports = function withDisableNotificationsBootActions(
  config,
  options = {}
) {
  const { removeBootPermission = false } = options;

  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    manifest.manifest.$ = manifest.manifest.$ || {};
    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    const targetName =
      "expo.modules.notifications.service.NotificationsService";

    const replacementReceiver = {
      $: {
        "android:name": targetName,
        "android:enabled": "true",
        "android:exported": "false",
        "tools:node": "replace",
      },
      "intent-filter": [
        {
          $: { "android:priority": "-1" },
          action: [
            {
              $: {
                "android:name":
                  "expo.modules.notifications.NOTIFICATION_EVENT",
              },
            },
          ],
        },
      ],
    };

    const receivers = asArray(app.receiver);
    const idx = receivers.findIndex(
      (r) => r?.$?.["android:name"] === targetName
    );

    if (idx >= 0) {
      receivers[idx] = replacementReceiver;
    } else {
      receivers.push(replacementReceiver);
    }

    app.receiver = receivers;

    if (removeBootPermission && manifest.manifest["uses-permission"]) {
      const perms = asArray(manifest.manifest["uses-permission"]);
      manifest.manifest["uses-permission"] = perms.filter(
        (p) =>
          p?.$?.["android:name"] !== "android.permission.RECEIVE_BOOT_COMPLETED"
      );
    }

    return config;
  });
};
