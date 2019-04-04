'use strict'

const {
  XML,
  assert
} = require('./common')

const Node = require('../../src/mindom/Node')
const Window = require('../../src/mindom/Window')
const window = new Window({
  baseURL: 'http://localhost'
})
assert(() => window)

const parser = new window.DOMParser()
assert(() => parser)

const xmlSource = `<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">
  <edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0">
    <Schema xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns="http://schemas.microsoft.com/ado/2007/05/edm" Namespace="ODataDemo">
      <EntityType Name="Product">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="false" />
        <Property Name="Description" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationSummary" m:FC_ContentKind="text" m:FC_KeepInContent="false" />
        <Property Name="ReleaseDate" Type="Edm.DateTime" Nullable="false" />
        <Property Name="DiscontinuedDate" Type="Edm.DateTime" Nullable="true" />
        <Property Name="Rating" Type="Edm.Int32" Nullable="false" />
        <Property Name="Price" Type="Edm.Decimal" Nullable="false" />
        <NavigationProperty Name="Category" Relationship="ODataDemo.Product_Category_Category_Products" FromRole="Product_Category" ToRole="Category_Products" />
        <NavigationProperty Name="Supplier" Relationship="ODataDemo.Product_Supplier_Supplier_Products" FromRole="Product_Supplier" ToRole="Supplier_Products" />
      </EntityType>
      <EntityType Name="Category">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="true" />
        <NavigationProperty Name="Products" Relationship="ODataDemo.Product_Category_Category_Products" FromRole="Category_Products" ToRole="Product_Category" />
      </EntityType>
      <EntityType Name="Supplier">
        <Key>
          <PropertyRef Name="ID" />
        </Key>
        <Property Name="ID" Type="Edm.Int32" Nullable="false" />
        <Property Name="Name" Type="Edm.String" Nullable="true" m:FC_TargetPath="SyndicationTitle" m:FC_ContentKind="text" m:FC_KeepInContent="true" />
        <Property Name="Address" Type="ODataDemo.Address" Nullable="false" />
        <Property Name="Concurrency" Type="Edm.Int32" Nullable="false" ConcurrencyMode="Fixed" />
        <NavigationProperty Name="Products" Relationship="ODataDemo.Product_Supplier_Supplier_Products" FromRole="Supplier_Products" ToRole="Product_Supplier" />
      </EntityType>
      <ComplexType Name="Address">
        <Property Name="Street" Type="Edm.String" Nullable="true" />
        <Property Name="City" Type="Edm.String" Nullable="true" />
        <Property Name="State" Type="Edm.String" Nullable="true" />
        <Property Name="ZipCode" Type="Edm.String" Nullable="true" />
        <Property Name="Country" Type="Edm.String" Nullable="true" />
      </ComplexType>
      <Association Name="Product_Category_Category_Products">
        <End Role="Product_Category" Type="ODataDemo.Product" Multiplicity="*" />
        <End Role="Category_Products" Type="ODataDemo.Category" Multiplicity="0..1" />
      </Association>
      <Association Name="Product_Supplier_Supplier_Products">
        <End Role="Product_Supplier" Type="ODataDemo.Product" Multiplicity="*" />
        <End Role="Supplier_Products" Type="ODataDemo.Supplier" Multiplicity="0..1" />
      </Association>
      <EntityContainer Name="DemoService" m:IsDefaultEntityContainer="true">
        <EntitySet Name="Products" EntityType="ODataDemo.Product" />
        <EntitySet Name="Categories" EntityType="ODataDemo.Category" />
        <EntitySet Name="Suppliers" EntityType="ODataDemo.Supplier" />
        <AssociationSet Name="Products_Category_Categories" Association="ODataDemo.Product_Category_Category_Products">
          <End Role="Product_Category" EntitySet="Products" />
          <End Role="Category_Products" EntitySet="Categories" />
        </AssociationSet>
        <AssociationSet Name="Products_Supplier_Suppliers" Association="ODataDemo.Product_Supplier_Supplier_Products">
          <End Role="Product_Supplier" EntitySet="Products" />
          <End Role="Supplier_Products" EntitySet="Suppliers" />
        </AssociationSet>
        <FunctionImport Name="GetProductsByRating" EntitySet="Products" ReturnType="Collection(ODataDemo.Product)" m:HttpMethod="GET">
          <Parameter Name="rating" Type="Edm.Int32" Mode="In" />
        </FunctionImport>
      </EntityContainer>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`
const document = parser.parseFromString(xmlSource, XML)

const namespacePrefixes = {
  edmx: 'http://schemas.microsoft.com/ado/2007/06/edmx',
  edm: 'http://schemas.microsoft.com/ado/2007/05/edm'
}

function selectNodes (xpath, rootNode) {
  console.log(xpath.yellow)
  const result = document.evaluate(xpath, rootNode, prefix => namespacePrefixes[prefix] || null, /* ORDERED_NODE_SNAPSHOT_TYPE: */ 7, null)
  assert(() => result)
  return result
}

function checkElement (node, { nodeName, attributeName = 'Name', attributeValue }) {
  assert(() => node && node.nodeType === Node.ELEMENT_NODE)
  assert(() => node.nodeName === nodeName)
  assert(() => node.getAttribute(attributeName) === attributeValue)
}

const allSchema = selectNodes('//edm:Schema', document)
assert(() => allSchema.snapshotLength === 1)
const schemaNode = allSchema.snapshotItem(0)
checkElement(schemaNode, {
  nodeName: 'Schema',
  attributeName: 'Namespace',
  attributeValue: 'ODataDemo'
})

const allEntities = selectNodes('./edm:EntityType', schemaNode)
assert(() => allEntities.snapshotLength === 3)
const productEntity = allEntities.snapshotItem(0)
checkElement(productEntity, {
  nodeName: 'EntityType',
  attributeValue: 'Product'
})
checkElement(allEntities.snapshotItem(1), {
  nodeName: 'EntityType',
  attributeValue: 'Category'
})
checkElement(allEntities.snapshotItem(2), {
  nodeName: 'EntityType',
  attributeValue: 'Supplier'
})

const categoryAssociations = selectNodes('//edm:Association[contains(@Name, \'Category_Category\')]', schemaNode)
assert(() => categoryAssociations.snapshotLength === 1)
checkElement(categoryAssociations.snapshotItem(0), {
  nodeName: 'Association',
  attributeValue: 'Product_Category_Category_Products'
})

const navigationProperties = selectNodes('./edm:*[@Relationship]', productEntity)
assert(() => navigationProperties.snapshotLength === 2)
checkElement(navigationProperties.snapshotItem(0), {
  nodeName: 'NavigationProperty',
  attributeValue: 'Category'
})
checkElement(navigationProperties.snapshotItem(1), {
  nodeName: 'NavigationProperty',
  attributeValue: 'Supplier'
})

const productProperties = selectNodes('//edm:EntityType[@Name=\'Product\']/edm:Property/@Name', document)
assert(() => productProperties.snapshotLength === 7)
'ID,Name,Description,ReleaseDate,DiscontinuedDate,Rating,Price'
  .split(',')
  .forEach((name, index) => assert(() => productProperties.snapshotItem(index).value === name))

const productKeys = selectNodes('//edm:EntityType[@Name=\'Product\']//edm:PropertyRef/@Name', document)
assert(() => productKeys.snapshotLength === 1)
assert(() => productKeys.snapshotItem(0).value === 'ID')

const gorNavigationProperties = selectNodes('./edm:*[@Relationship and contains(@Name, \'gor\')]', productEntity)
assert(() => gorNavigationProperties.snapshotLength === 1)
checkElement(gorNavigationProperties.snapshotItem(0), {
  nodeName: 'NavigationProperty',
  attributeValue: 'Category'
})

const definedTypes = selectNodes('//edm:EntityType | //edm:ComplexType', document)
assert(() => definedTypes.snapshotLength === 4)
checkElement(definedTypes.snapshotItem(0), {
  nodeName: 'EntityType',
  attributeValue: 'Product'
})
checkElement(definedTypes.snapshotItem(1), {
  nodeName: 'EntityType',
  attributeValue: 'Category'
})
checkElement(definedTypes.snapshotItem(2), {
  nodeName: 'EntityType',
  attributeValue: 'Supplier'
})
checkElement(definedTypes.snapshotItem(3), {
  nodeName: 'ComplexType',
  attributeValue: 'Address'
})
