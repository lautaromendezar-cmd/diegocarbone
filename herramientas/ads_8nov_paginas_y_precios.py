"""8-nov-2026: cambios de Ads junto con las páginas por servicio (cuenta 730-536-3791).

Todo en un único mutate atómico (o se aplica todo o nada):
1. URL final a nivel keyword: cada keyword de Gaucho / Tigre / City va a su página en el idioma
   del grupo. Las genéricas (day tour, private guide…) siguen en el home del idioma.
2. Extensión de precios: una en inglés en el grupo inglés y otra en francés en el grupo francés.
3. Negativas de campaña: tangol (competidor) y papa («recorrido del papa»).
4. «excursion buenos aires» (francés): de frase a exacta. La de frase queda PAUSADA, no borrada.
5. Tope de CPC de Maximizar clics: $1.400 → $1.700 (se perdía el 37 % de impresiones por ranking
   y sobraban ~$700/día de presupuesto).

  uv run --with google-ads python herramientas/ads_8nov_paginas_y_precios.py            → solo valida
  uv run --with google-ads python herramientas/ads_8nov_paginas_y_precios.py --aplicar  → aplica
"""
import os
import sys

os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", os.path.expanduser("~/.google-ads-mcp/credentials.json"))

import google.auth  # noqa: E402
from google.ads.googleads.client import GoogleAdsClient  # noqa: E402
from google.protobuf import field_mask_pb2  # noqa: E402

CLIENTE = "7305363791"
CAMPANA = "24008068309"
GRUPO_EN = "200829018889"
GRUPO_FR = "204408889641"
TOPE_PESOS = 1700
SITIO = "https://www.transferbuenosaires.com"
APLICAR = "--aplicar" in sys.argv

# keyword (criterion_id) → página. Grupo inglés.
URLS_EN = {
    "gaucho-day": [353599504930, 533802861780, 548073363013, 2489275253886, 2489275323726, 2492357072598],
    "tigre": [1404156600921, 1816710101262, 2489275271726, 2489275323566],
    "city-tour": [489051073323, 2489275253926, 2489275351646],
}
# Grupo francés
URLS_FR = {
    "tigre": [360245893388],        # excursion tigre
    "gaucho-day": [2500969079420],  # estancia gaucho buenos aires
    "city-tour": [360548886865],    # visite guidée buenos aires
}
EXCURSION_BA_FRASE = 297538330968

PRECIOS = {
    "en": [
        ("City Tour", "Private · 4 hours", 200, "city-tour"),
        ("Tigre & San Isidro", "Private · half day", 350, "tigre"),
        ("Gaucho Day", "Estancia · asado", 550, "gaucho-day"),
        ("Aeroparque Transfer", "Per vehicle · fixed", 35, "airport-transfer"),
    ],
    "fr": [
        ("Visite de Buenos Aires", "Privée · 4 heures", 200, "city-tour"),
        ("Tigre et San Isidro", "Privée · demi-journée", 350, "tigre"),
        ("Journée gaucho", "Estancia · asado", 550, "gaucho-day"),
        ("Transfert Aeroparque", "Par véhicule · fixe", 35, "airport-transfer"),
    ],
}


def main():
    credenciales, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/adwords"])
    c = GoogleAdsClient(credentials=credenciales, use_proto_plus=True)
    ops = []

    def mutate_op():
        op = c.get_type("MutateOperation")
        ops.append(op)
        return op

    # 1. URL final por keyword
    for grupo, lang, mapa in ((GRUPO_EN, "en", URLS_EN), (GRUPO_FR, "fr", URLS_FR)):
        for slug, ids in mapa.items():
            for crit in ids:
                op = mutate_op().ad_group_criterion_operation
                op.update.resource_name = f"customers/{CLIENTE}/adGroupCriteria/{grupo}~{crit}"
                op.update.final_urls.append(f"{SITIO}/{lang}/{slug}")
                op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["final_urls"]))

    # 2. Extensiones de precios (recurso temporal -1/-2) y su vínculo al grupo
    for temp_id, (lang, grupo) in enumerate((("en", GRUPO_EN), ("fr", GRUPO_FR)), start=1):
        asset_rn = f"customers/{CLIENTE}/assets/-{temp_id}"
        op = mutate_op().asset_operation
        a = op.create
        a.resource_name = asset_rn
        a.price_asset.type_ = c.enums.PriceExtensionTypeEnum.SERVICES
        a.price_asset.language_code = lang
        for header, desc, usd, slug in PRECIOS[lang]:
            o = c.get_type("PriceOffering")
            o.header = header
            o.description = desc
            o.price.currency_code = "USD"
            o.price.amount_micros = usd * 1_000_000
            o.final_url = f"{SITIO}/{lang}/{slug}"
            a.price_asset.price_offerings.append(o)

        op = mutate_op().ad_group_asset_operation
        op.create.ad_group = f"customers/{CLIENTE}/adGroups/{grupo}"
        op.create.asset = asset_rn
        op.create.field_type = c.enums.AssetFieldTypeEnum.PRICE

    # 3. Negativas de campaña
    for texto in ("tangol", "papa"):
        op = mutate_op().campaign_criterion_operation
        op.create.campaign = f"customers/{CLIENTE}/campaigns/{CAMPANA}"
        op.create.negative = True
        op.create.keyword.text = texto
        op.create.keyword.match_type = c.enums.KeywordMatchTypeEnum.BROAD

    # 4. «excursion buenos aires»: exacta nueva, frase pausada
    op = mutate_op().ad_group_criterion_operation
    op.create.ad_group = f"customers/{CLIENTE}/adGroups/{GRUPO_FR}"
    op.create.status = c.enums.AdGroupCriterionStatusEnum.ENABLED
    op.create.keyword.text = "excursion buenos aires"
    op.create.keyword.match_type = c.enums.KeywordMatchTypeEnum.EXACT

    op = mutate_op().ad_group_criterion_operation
    op.update.resource_name = f"customers/{CLIENTE}/adGroupCriteria/{GRUPO_FR}~{EXCURSION_BA_FRASE}"
    op.update.status = c.enums.AdGroupCriterionStatusEnum.PAUSED
    op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["status"]))

    # 5. Tope de CPC
    op = mutate_op().campaign_operation
    op.update.resource_name = f"customers/{CLIENTE}/campaigns/{CAMPANA}"
    op.update.target_spend.cpc_bid_ceiling_micros = TOPE_PESOS * 1_000_000
    op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["target_spend.cpc_bid_ceiling_micros"]))

    r = c.get_service("GoogleAdsService").mutate(
        request={"customer_id": CLIENTE, "mutate_operations": ops, "validate_only": not APLICAR})
    print(f"{len(ops)} operaciones:", "aplicadas" if APLICAR else "validadas")
    if APLICAR:
        for res in r.mutate_operation_responses:
            print(" ", res)


if __name__ == "__main__":
    main()
