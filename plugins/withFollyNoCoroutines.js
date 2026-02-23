const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withFollyNoCoroutines(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      if (podfile.includes("FOLLY_CFG_NO_COROUTINES")) {
        return config;
      }

      const snippet = `
  # Fix: consistent Folly config across all pods (coroutines + F14 intrinsics)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_MOBILE=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAS_COROUTINES=0'
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_HAVE_CLOCK_GETTIME=1'
    end
  end`;

      podfile = podfile.replace(
        /post_install do \|installer\|/,
        `post_install do |installer|${snippet}`
      );

      fs.writeFileSync(podfilePath, podfile, "utf8");
      return config;
    },
  ]);
}

module.exports = withFollyNoCoroutines;
