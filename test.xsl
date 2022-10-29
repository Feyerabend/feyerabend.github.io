<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:template match="/">
    <h1><xsl:value-of select="/Article/Title"/></h1>
    <xsl:apply-templates select="/Article/Author"/>
    <xsl:apply-templates select="/Article/Body/Paragraph"/>  
  </xsl:template>

  <xsl:template match="Author">
    <em><xsl:value-of select="." /></em>
  </xsl:template>

  <xsl:template match="Paragraph">
    <xsl:for-each select="/Article/Body">
      <p><xsl:value-of select="Paragraph" /></p>           
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
