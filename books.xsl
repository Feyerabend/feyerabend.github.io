<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/xsl/transform"
  xmlns:ixsl="http://saxonica.com/ns/interactivexslt"
  xmlns:prop="http://saxonica.com/ns/html-property"
  xmlns:style="http://saxonica.com/ns/html-style-property"
  xmlns:xs="http://www.w3.org/2001/xmlschema"
  exclude-result-prefixes="xs prop"
  extension-element-prefixes="ixsl"
  version="2.0">

  <!-- this style sheet displays the books.xml file.  -->


  <xsl:template match="/">

<!--
    <xsl:result-document href="#title" method="ixsl:replace-content">
      <xsl:value-of>books available at <xsl:value-of select="format-date(current-date(), '[d] [mnn] [y]')"/></xsl:value-of>
    </xsl:result-document>

    <xsl:result-document href="#books">
      <table>
        <thead><tr><th>author</th><th>title</th><th data-type="number">price</th></tr></thead>
        <tbody>
          <xsl:for-each select="//item">
            <tr data-genre="{@cat}">
              <td><xsl:value-of select="author"/></td>
              <td><xsl:value-of select="title"/></td>
              <td align="right"><xsl:value-of select="price"/></td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
    </xsl:result-document>

    <xsl:result-document href="#genres">
      <form>
        <table>
          <thead>
            <tr><th>code</th><th>description</th></tr>
          </thead>
          <tbody>
            <xsl:for-each select="//category">
              <tr>
                <td><xsl:value-of select="@code"/></td>
                <td><xsl:value-of select="@desc"/></td>
                <td><input type="checkbox" name="genre" value="{@code}" checked="checked"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </form>
    </xsl:result-document>

  </xsl:template>

  <xsl:template match="th" mode="ixsl:onclick">
    <xsl:variable name="colnr" as="xs:integer"  select="count(preceding-sibling::th)+1"/>
    <xsl:apply-templates select="ancestor::table[1]" mode="sort">
      <xsl:with-param name="colnr" select="$colnr"/>
      <xsl:with-param name="datatype" select="if (@data-type='number') then 'number' else 'text'"/>
      <xsl:with-param name="ascending" select="not(../../@data-order=$colnr)"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="table" mode="sort">
    <xsl:param name="colnr" as="xs:integer" required="yes"/>
    <xsl:param name="datatype" as="xs:string" required="yes"/>
    <xsl:param name="ascending" as="xs:boolean" required="yes"/>
    <xsl:result-document href="?select=." method="ixsl:replace-content">
      <thead data-order="{if ($ascending) then $colnr else -$colnr}">
        <xsl:copy-of select="thead/tr"/>
      </thead>
      <tbody>
        <xsl:perform-sort select="tbody/tr">
          <xsl:sort select="td[$colnr]"
            data-type="{$datatype}"
            order="{if ($ascending) then 'ascending' else 'descending'}"/>
        </xsl:perform-sort>
      </tbody>
    </xsl:result-document>
  </xsl:template>

  <xsl:template match="input[@type='checkbox'][@name='genre']" mode="ixsl:onclick">
    <xsl:variable name="this" select="."/>
    <xsl:for-each select="//div[@id='books']//tr[@data-genre=$this/@value]">
      <ixsl:set-attribute name="style:display"
                            select="if ($this/@prop:checked='true')
                                    then 'table-row'
                                    else 'none'"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="th" mode="ixsl:onmouseover">
    <xsl:for-each select="//div[@id='sorttooltip']">
        <ixsl:set-attribute name="style:left" select="concat(ixsl:get(ixsl:event(), 'clientx') + 30, 'px')"/>
        <ixsl:set-attribute name="style:top" select="concat(ixsl:get(ixsl:event(), 'clienty') - 15, 'px')"/>
        <ixsl:set-attribute name="style:visibility" select="'visible'"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="th" mode="ixsl:onmouseout">
    <xsl:for-each select="//div[@id='sorttooltip']">
        <ixsl:set-attribute name="style:visibility" select="'hidden'"/>
    </xsl:for-each>
  </xsl:template>
-->

</xsl:transform>
