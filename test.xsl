<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:template match="/">
    Article - <xsl:value-of select="/Article/Title"/>
    <p>Author(s): <xsl:apply-templates select="/Article/Authors/Author"/></p>
  </xsl:template>
  <xsl:template match="Author">
    - <em><xsl:value-of select="." /></em>
  </xsl:template>
</xsl:stylesheet>
