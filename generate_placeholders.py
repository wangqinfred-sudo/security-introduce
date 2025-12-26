from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class Spec:
    feature_cn: str
    slug: str
    admin_steps: int
    employee_steps: int


ROOT = Path(__file__).resolve().parent


SPECS: list[Spec] = [
    # 终端安全介绍
    Spec(feature_cn="移动端文件加密", slug="terminal-mobile-file-encryption", admin_steps=5, employee_steps=4),
    Spec(feature_cn="粘贴保护", slug="terminal-paste-protection", admin_steps=5, employee_steps=4),
    Spec(feature_cn="截屏录屏保护", slug="terminal-screenshot-record-protection", admin_steps=5, employee_steps=2),

    # 访问安全介绍
    Spec(feature_cn="访问策略管理", slug="access-policy-management", admin_steps=4, employee_steps=2),

    # 数据保护
    Spec(feature_cn="密级标签", slug="data-classification-tag", admin_steps=7, employee_steps=3),
    Spec(feature_cn="水印设置", slug="data-watermark", admin_steps=5, employee_steps=2),
    Spec(feature_cn="飞书DLP", slug="data-feishu-dlp", admin_steps=7, employee_steps=2),

    # 成员权限
    Spec(feature_cn="组织架构可见范围", slug="member-org-visibility-scope", admin_steps=5, employee_steps=2),
    Spec(feature_cn="名片字段可见范围", slug="member-card-field-visibility-scope", admin_steps=4, employee_steps=2),
    Spec(feature_cn="搜索权限", slug="member-search-permission", admin_steps=4, employee_steps=3),
    Spec(feature_cn="沟通协作", slug="member-collaboration", admin_steps=4, employee_steps=4),
    Spec(feature_cn="对外沟通权限", slug="member-external-communication-permission", admin_steps=5, employee_steps=2),
    Spec(feature_cn="云文档设置", slug="member-cloud-doc-settings", admin_steps=5, employee_steps=2),
    Spec(feature_cn="文件操作权限", slug="member-file-operation-permission", admin_steps=6, employee_steps=3),
    Spec(feature_cn="文档权限默认值管理", slug="member-doc-permission-defaults", admin_steps=5, employee_steps=2),

    # 日志审计
    Spec(feature_cn="管理员日志", slug="log-audit-admin-logs", admin_steps=3, employee_steps=0),
    Spec(feature_cn="openapi日志", slug="log-audit-openapi-logs", admin_steps=3, employee_steps=0),
    Spec(feature_cn="成员行为审计", slug="log-audit-member-behavior", admin_steps=3, employee_steps=0),
]


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    # 尽量使用系统字体，失败则回退默认字体
    for font_name in [
        "PingFang SC",
        "Helvetica",
        "Arial",
    ]:
        try:
            return ImageFont.truetype(font_name, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _draw_centered(draw: ImageDraw.ImageDraw, *, xy: tuple[int, int], text: str, font, fill):
    x, y = xy
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((x - w // 2, y - h // 2), text, font=font, fill=fill)


def make_placeholder(path: Path, *, title: str, subtitle: str, size: tuple[int, int] = (1600, 1000)):
    width, height = size
    bg = (245, 246, 248)
    border = (210, 215, 223)
    text_primary = (31, 41, 55)
    text_secondary = (107, 114, 128)
    accent = (20, 86, 240)

    img = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(img)

    # 边框
    draw.rounded_rectangle((40, 40, width - 40, height - 40), radius=24, outline=border, width=4)

    # 标题
    title_font = _load_font(64)
    subtitle_font = _load_font(36)
    filename_font = _load_font(28)

    _draw_centered(draw, xy=(width // 2, height // 2 - 40), text=title, font=title_font, fill=text_primary)
    _draw_centered(draw, xy=(width // 2, height // 2 + 40), text=subtitle, font=subtitle_font, fill=text_secondary)

    # 文件名（底部）
    draw.rectangle((0, height - 120, width, height), fill=(255, 255, 255))
    draw.line((0, height - 120, width, height - 120), fill=border, width=2)
    _draw_centered(
        draw,
        xy=(width // 2, height - 60),
        text=path.name,
        font=filename_font,
        fill=accent,
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG")


def main():
    created: list[Path] = []
    skipped: list[Path] = []

    for spec in SPECS:
        # admin
        for step in range(1, spec.admin_steps + 1):
            p = ROOT / f"{spec.slug}-admin-step{step}.png"
            if p.exists():
                skipped.append(p)
                continue
            make_placeholder(p, title=spec.feature_cn, subtitle=f"管理员配置 - 步骤 {step}")
            created.append(p)

        # employee
        for step in range(1, spec.employee_steps + 1):
            p = ROOT / f"{spec.slug}-step{step}.png"
            if p.exists():
                skipped.append(p)
                continue
            make_placeholder(p, title=spec.feature_cn, subtitle=f"员工端体验 - 步骤 {step}")
            created.append(p)

    print(f"Created {len(created)} PNG(s)")
    for p in created:
        print(p.name)
    if skipped:
        print(f"\nSkipped {len(skipped)} existing file(s)")
        for p in skipped:
            print(p.name)


if __name__ == "__main__":
    main()
