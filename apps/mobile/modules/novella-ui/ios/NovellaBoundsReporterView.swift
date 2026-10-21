import ExpoModulesCore
import UIKit

final class NovellaBoundsReporterView: ExpoView {
  let onBoundsChange = EventDispatcher()

  private var reportedSize: CGSize = .zero

  override func layoutSubviews() {
    super.layoutSubviews()
    let size = bounds.size
    guard size.width > 0, size.height > 0 else { return }
    guard abs(size.width - reportedSize.width) >= 0.5
      || abs(size.height - reportedSize.height) >= 0.5 else { return }
    reportedSize = size
    onBoundsChange(["height": size.height, "width": size.width])
  }
}
