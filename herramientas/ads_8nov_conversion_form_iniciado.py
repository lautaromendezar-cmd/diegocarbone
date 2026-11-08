"""8-nov-2026: conversión secundaria «Formulario iniciado» (cuenta Transfer Buenos Aires 730-536-3791).

Se dispara la primera vez que alguien toca un campo del formulario de reserva. Sirve para
separar «nadie empieza el formulario» de «lo empiezan y lo abandonan». Es secundaria:
no entra en la puja ni en la columna Conversiones (la campaña usa objetivos propios,
sólo «Enviar formulario»).

  uv run --with google-ads python herramientas/ads_8nov_conversion_form_iniciado.py            → solo valida
  uv run --with google-ads python herramientas/ads_8nov_conversion_form_iniciado.py --aplicar  → crea e imprime el send_to
"""
import os
import sys

os.environ.setdefault("GOOGLE_APPLICATION_CREDENTIALS", os.path.expanduser("~/.google-ads-mcp/credentials.json"))

import google.auth  # noqa: E402
from google.ads.googleads.client import GoogleAdsClient  # noqa: E402

CLIENTE = "7305363791"
APLICAR = "--aplicar" in sys.argv


def main():
    credenciales, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/adwords"])
    c = GoogleAdsClient(credentials=credenciales, use_proto_plus=True)

    op = c.get_type("ConversionActionOperation")
    ca = op.create
    ca.name = "Formulario iniciado"
    ca.type_ = c.enums.ConversionActionTypeEnum.WEBPAGE
    ca.category = c.enums.ConversionActionCategoryEnum.ENGAGEMENT
    ca.status = c.enums.ConversionActionStatusEnum.ENABLED
    ca.counting_type = c.enums.ConversionActionCountingTypeEnum.ONE_PER_CLICK
    ca.primary_for_goal = False
    ca.value_settings.default_value = 0
    ca.value_settings.always_use_default_value = True

    r = c.get_service("ConversionActionService").mutate_conversion_actions(
        request={"customer_id": CLIENTE, "operations": [op], "validate_only": not APLICAR})
    if not APLICAR:
        print("conversión: validada")
        return
    rn = r.results[0].resource_name
    print("creada:", rn)
    q = f"SELECT conversion_action.tag_snippets FROM conversion_action WHERE conversion_action.resource_name = '{rn}'"
    for fila in c.get_service("GoogleAdsService").search(customer_id=CLIENTE, query=q):
        for s in fila.conversion_action.tag_snippets:
            if "send_to" in s.event_snippet:
                print(s.event_snippet)
                break


if __name__ == "__main__":
    main()
