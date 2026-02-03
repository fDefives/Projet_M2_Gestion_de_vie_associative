# Generated migration to add expire_si_changement_president field

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0004_roletype_remove_membre_member_type_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="typedocument",
            name="expire_si_changement_president",
            field=models.BooleanField(
                default=False,
                help_text="Si vrai, le document expire automatiquement lors du changement de président",
            ),
        ),
        migrations.AlterField(
            model_name="association",
            name="desc_association",
            field=models.TextField(blank=True, null=True),
        ),
    ]
